import { BigNumber } from 'ethers';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';
import { routerSupportAbi } from 'src/features/on-chain/calculation-manager/providers/dexes/common/sync-swap-abstract/router-support-abi';
import {
    RoutePoolData,
    RoutePools,
    RoutePoolsBlockchain
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/sync-swap-abstract/utils/typings';

type StringRoutePoolData = Omit<RoutePoolData, 'reserveA' | 'reserveB'> & {
    reserveA: string;
    reserveB: string;
};

interface RoutePoolsBlockchainResponse {
    poolsA: StringRoutePoolData[];
    poolsB: StringRoutePoolData[];
    poolsBase: StringRoutePoolData[];
    poolsDirect: StringRoutePoolData[];
}

export class SyncSwapFactory {
    private static normalizePool(vault: string, pool: RoutePoolData): RoutePoolData {
        return {
            ...pool,
            vault,
            tokenA: pool.tokenA.toLowerCase(),
            tokenB: pool.tokenB.toLowerCase()
        };
    }

    private static normalizePools(vault: string, pools: RoutePoolData[]): RoutePoolData[] {
        return [...pools].map(pool => SyncSwapFactory.normalizePool(vault, pool));
    }

    private static transformResponse(routes: RoutePoolsBlockchainResponse): RoutePoolsBlockchain {
        const fn: (el: StringRoutePoolData) => RoutePoolData = el => ({
            ...el,
            reserveA: BigNumber.from(el.reserveA),
            reserveB: BigNumber.from(el.reserveB)
        });
        return {
            poolsDirect: routes.poolsDirect.map(fn),
            poolsA: routes.poolsA.map(fn),
            poolsB: routes.poolsB.map(fn),
            poolsBase: routes.poolsBase.map(fn)
        };
    }

    public static async fetchRoutePools(
        tokenA: string,
        tokenB: string,
        account: string,
        vault: string,
        factories: string[],
        routeTokens: string[],
        masterAddress: string,
        routerHelperAddress: string,
        blockchain: EvmBlockchainName
    ): Promise<RoutePools | null> {
        try {
            const web3Public = Injector.web3PublicService.getWeb3Public(blockchain);
            const response = (await web3Public.callContractMethod(
                routerHelperAddress,
                routerSupportAbi,
                'getRoutePools',
                [tokenA, tokenB, factories, routeTokens, masterAddress, account]
            )) as unknown as RoutePoolsBlockchainResponse;

            const payload = SyncSwapFactory.transformResponse(response);
            const poolsDirect = SyncSwapFactory.normalizePools(vault, payload.poolsDirect);

            const [directPoolClassic, directPoolStable] = [poolsDirect[0]!, poolsDirect[1]!];
            const directPoolOptimal =
                directPoolClassic.reserveA > directPoolStable.reserveA.mul(2)
                    ? directPoolClassic
                    : directPoolStable;

            return {
                directPoolOptimal,
                routeTokens,
                tokenA,
                tokenB,
                timestamp: Date.now(),
                pools: {
                    poolsDirect,
                    poolsA: SyncSwapFactory.normalizePools(vault, payload.poolsA),
                    poolsB: SyncSwapFactory.normalizePools(vault, payload.poolsB),
                    poolsBase: SyncSwapFactory.normalizePools(vault, payload.poolsBase)
                }
            };
        } catch (error) {
            return null;
        }
    }
}
