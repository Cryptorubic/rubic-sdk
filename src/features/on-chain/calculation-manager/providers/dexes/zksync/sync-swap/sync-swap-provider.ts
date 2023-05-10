import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { combineOptions } from 'src/common/utils/options';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';
import { EvmOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/evm-on-chain-provider';
import { PoolInfo } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/models/pool-info';
import { routerSupportAbi } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/router-support-abi';
import { SyncSwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/sync-swap-trade';

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

        const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, fullOptions);

        const test = (await this.fetchRoutePools(from.address, toToken.address)) as {
            poolsBase: PoolInfo[];
        };
        const amountOut = Web3Pure.fromWei(
            this.getAmountOut(from.weiAmount, from.address, test.poolsBase[0]!),
            toToken.decimals
        );

        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            weiAmount: new BigNumber(amountOut)
        });

        const tradeStruct: EvmOnChainTradeStruct = {
            from,
            to,
            slippageTolerance: fullOptions.slippageTolerance,
            gasFeeInfo: null,
            useProxy: fullOptions.useProxy,
            proxyFeeInfo,
            fromWithoutFee,
            withDeflation: fullOptions.withDeflation,
            usedForCrossChain: fullOptions.usedForCrossChain,
            path: [from, toToken]
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
                this.walletAddress
            ]
        );
    }

    private getAmountOut(amountIn: BigNumber, fromAddress: string, poolInfo: PoolInfo): BigNumber {
        const [reserveFrom, reserveTo] =
            poolInfo.tokenA === fromAddress
                ? [poolInfo.reserveA, poolInfo.reserveB, poolInfo.swapFeeAB]
                : [poolInfo.reserveB, poolInfo.reserveA, poolInfo.swapFeeBA];
        const amountInWithFee = amountIn.multipliedBy(998);
        const numerator = amountInWithFee.multipliedBy(reserveTo);
        const denominator = new BigNumber(reserveFrom).multipliedBy(1000).plus(amountInWithFee);
        return numerator.dividedBy(denominator).plus(1);
    }
}
