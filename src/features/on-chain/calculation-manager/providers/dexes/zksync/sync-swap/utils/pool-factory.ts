import { BigNumber } from 'ethers';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';
import { routerSupportAbi } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/router-support-abi';
import {
    RoutePoolData,
    RoutePools,
    RoutePoolsBlockchain
} from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/utils/typings';

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

export class PoolFactory {
    private static normalizePool(vault: string, pool: RoutePoolData): RoutePoolData {
        return {
            ...pool,
            vault,
            tokenA: pool.tokenA.toLowerCase(),
            tokenB: pool.tokenB.toLowerCase()
        };
    }

    private static normalizePools(vault: string, pools: RoutePoolData[]): RoutePoolData[] {
        return [...pools].map(pool => PoolFactory.normalizePool(vault, pool));
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
        masterAddress: string
    ): Promise<RoutePools | null> {
        try {
            const web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ZK_SYNC);
            const response = (await web3Public.callContractMethod(
                '0x5c07e74cb541c3d1875aeee441d691ded6eba204',
                routerSupportAbi,
                'getRoutePools',
                [tokenA, tokenB, factories, routeTokens, masterAddress, account]
            )) as unknown as RoutePoolsBlockchainResponse;

            const payload = PoolFactory.transformResponse(response);
            const poolsDirect = PoolFactory.normalizePools(vault, payload.poolsDirect);

            // Finds the optimal pool.
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
                    poolsA: PoolFactory.normalizePools(vault, payload.poolsA),
                    poolsB: PoolFactory.normalizePools(vault, payload.poolsB),
                    poolsBase: PoolFactory.normalizePools(vault, payload.poolsBase)
                }
            };
        } catch (error) {
            return null;
        }
    }
}
