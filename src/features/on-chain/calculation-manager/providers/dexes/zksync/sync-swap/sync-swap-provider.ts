import BigNumber from 'bignumber.js';
import { BigNumber as BigNumberEthers } from 'ethers';
import { NotSupportedTokensError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, wrappedNativeTokensList } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { combineOptions } from 'src/common/utils/options';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Injector } from 'src/core/injector/injector';
import { createTokenNativeAddressProxy } from 'src/features/common/utils/token-native-address-proxy';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';
import { EvmOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/evm-on-chain-provider';
import { PoolInfo } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/models/pool-info';
import { routerSupportAbi } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/router-support-abi';
import { syncSwapStablePool } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/sync-swap-stable-pool';
import { SyncSwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/sync-swap-trade';
import { getAmountOutStable } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/utils';

export class SyncSwapProvider extends EvmOnChainProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.ZK_SYNC;

    private readonly defaultOptions = evmProviderDefaultOptions;

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.SYNC_SWAP;
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options?: OnChainCalculationOptions
    ): Promise<SyncSwapTrade> {
        const fromAddress =
            options?.useProxy || this.defaultOptions.useProxy
                ? rubicProxyContractAddress[from.blockchain].gateway
                : this.walletAddress;
        const fullOptions = combineOptions(options, {
            ...this.defaultOptions,
            fromAddress
        });
        const fromProxy = createTokenNativeAddressProxy(
            from,
            wrappedNativeTokensList[from.blockchain]!.address
        );
        const toProxy = createTokenNativeAddressProxy(
            toToken,
            wrappedNativeTokensList[from.blockchain]!.address
        );

        const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(
            fromProxy,
            fullOptions
        );

        const routePools = await this.fetchRoutePools(fromWithoutFee.address, toProxy.address);
        const poolData = this.getPoolData(routePools);
        if (
            poolData.reserveA === '0' ||
            poolData.reserveB === '0' ||
            compareAddresses(poolData.pool, EvmWeb3Pure.EMPTY_ADDRESS)
        ) {
            throw new NotSupportedTokensError();
        }

        const weiAmountOut = await this.getAmountOut(
            fromWithoutFee.weiAmount,
            fromWithoutFee.address,
            poolData
        );

        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            weiAmount: weiAmountOut
        });

        const tradeStruct = {
            from,
            to,
            slippageTolerance: fullOptions.slippageTolerance,
            gasFeeInfo: null,
            useProxy: fullOptions.useProxy,
            proxyFeeInfo,
            fromWithoutFee,
            withDeflation: fullOptions.withDeflation,
            usedForCrossChain: fullOptions.usedForCrossChain,
            path: [from, toToken],
            poolData
        };

        return new SyncSwapTrade(tradeStruct, fullOptions.providerAddress);
    }

    private fetchRoutePools(tokenFrom: string, tokenTo: string): Promise<unknown> {
        const web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ZK_SYNC);
        return web3Public.callContractMethod(
            '0x5c07e74cb541c3d1875aeee441d691ded6eba204',
            routerSupportAbi,
            'getRoutePools',
            [
                tokenFrom,
                tokenTo,
                [
                    '0xf2dad89f2788a8cd54625c60b55cd3d2d0aca7cb',
                    '0x5b9f21d407f35b10cbfddca17d5d84b129356ea3'
                ],
                [tokenFrom, tokenTo],
                '0xbb05918e9b4ba9fe2c8384d223f0844867909ffb',
                this.walletAddress || EvmWeb3Pure.EMPTY_ADDRESS
            ]
        );
    }

    public getPoolData(poolsInfo: unknown): PoolInfo {
        const { poolsBase } = poolsInfo as { poolsBase: PoolInfo[] };
        const isFirstPoolReserveABetter = new BigNumber(poolsBase[0]?.reserveA || 0).gt(
            new BigNumber(poolsBase[1]?.reserveA || 0)
        );
        const isFirstPoolReserveBBetter = new BigNumber(poolsBase[0]?.reserveB || 0).gt(
            new BigNumber(poolsBase[1]?.reserveB || 0)
        );

        return isFirstPoolReserveABetter && isFirstPoolReserveBBetter
            ? poolsBase[0]!
            : poolsBase[1]!;
    }

    private async getAmountOut(
        amountIn: BigNumber,
        fromAddress: string,
        poolInfo: PoolInfo
    ): Promise<BigNumber> {
        const [reserveFrom, reserveTo, fee, tokenFromAddress] = compareAddresses(
            poolInfo.tokenA,
            fromAddress
        )
            ? [poolInfo.reserveA, poolInfo.reserveB, poolInfo.swapFeeAB, poolInfo.tokenA]
            : [poolInfo.reserveB, poolInfo.reserveA, poolInfo.swapFeeBA, poolInfo.tokenB];
        const maxFee = new BigNumber(100_000);

        // Stable swap
        if (poolInfo.poolType === '2') {
            const { fromPrecisionMultiplier, toPrecisionMultiplier } = await this.getPoolPrecision(
                poolInfo.pool,
                tokenFromAddress
            );
            const out = getAmountOutStable({
                amountIn: BigNumberEthers.from(amountIn.toFixed()),
                reserveIn: BigNumberEthers.from(reserveFrom),
                reserveOut: BigNumberEthers.from(reserveTo),
                swapFee: BigNumberEthers.from(fee),
                A: BigNumberEthers.from(1000),
                tokenInPrecisionMultiplier: BigNumberEthers.from(fromPrecisionMultiplier),
                tokenOutPrecisionMultiplier: BigNumberEthers.from(toPrecisionMultiplier)
            });
            return new BigNumber(out.toHexString());
        }
        const amountInWithFee = amountIn.multipliedBy(maxFee.minus(fee));
        return amountInWithFee
            .multipliedBy(reserveTo)
            .dividedBy(new BigNumber(reserveFrom).multipliedBy(maxFee).plus(amountInWithFee));
    }

    private async getPoolPrecision(
        address: string,
        fromAddress: string
    ): Promise<{ fromPrecisionMultiplier: string; toPrecisionMultiplier: string }> {
        const token0 = await this.web3Public.callContractMethod(
            address,
            syncSwapStablePool,
            'token0',
            []
        );
        const token0PM = await this.web3Public.callContractMethod(
            address,
            syncSwapStablePool,
            'token0PrecisionMultiplier',
            []
        );
        const token1PM = await this.web3Public.callContractMethod(
            address,
            syncSwapStablePool,
            'token1PrecisionMultiplier',
            []
        );
        return compareAddresses(token0, fromAddress)
            ? {
                  fromPrecisionMultiplier: token0PM,
                  toPrecisionMultiplier: token1PM
              }
            : {
                  fromPrecisionMultiplier: token1PM,
                  toPrecisionMultiplier: token0PM
              };
    }
}