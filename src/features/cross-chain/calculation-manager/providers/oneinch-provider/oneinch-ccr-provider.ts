import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { FeeInfo } from '../common/models/fee-info';
import { RubicStep } from '../common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import {
    OneinchCcrSupportedChain,
    oneinchCcrSupportedChains
} from './constants/oneinch-ccr-supported-chains';
import { OneinchCcrTrade } from './oneinch-ccr-trade';
import { OneinchCcrApiService } from './services/oneinch-ccr-api-service';

export class OneinchCcrProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.ONEINCH;

    public isSupportedBlockchain(fromBlockchain: BlockchainName): boolean {
        return oneinchCcrSupportedChains.some(chain => chain === fromBlockchain);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as OneinchCcrSupportedChain;
        // const useProxy = options?.useProxy?.[this.type] ?? true;
        const useProxy = false;
        const walletAddress = options.fromAddress || this.getWalletAddress(fromBlockchain);

        try {
            const feeInfo = await this.getFeeInfo(
                fromBlockchain,
                options.providerAddress,
                from,
                useProxy
            );
            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            const quote = await OneinchCcrApiService.fetchQuote({
                srcToken: fromWithoutFee,
                dstToken: toToken,
                walletAddress
            });

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: new BigNumber(quote.dstTokenAmount)
            });

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await OneinchCcrTrade.getGasData({
                          from: fromWithoutFee,
                          feeInfo,
                          toToken: to,
                          providerAddress: options.providerAddress,
                          quote,
                          slippage: options.slippageTolerance
                      })
                    : null;

            return {
                trade: new OneinchCcrTrade({
                    crossChainTrade: {
                        feeInfo,
                        from,
                        to,
                        gasData,
                        priceImpact: from.calculatePriceImpactPercent(to),
                        slippage: options.slippageTolerance,
                        quote
                    },
                    providerAddress: options.providerAddress,
                    routePath: await this.getRoutePath(from, to),
                    useProxy
                }),
                tradeType: this.type
            };
        } catch (err) {
            const rubicSdkError = CrossChainProvider.parseError(err);

            return {
                trade: null,
                error: rubicSdkError,
                tradeType: this.type
            };
        }
    }

    protected async getFeeInfo(
        fromBlockchain: OneinchCcrSupportedChain,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount,
        useProxy: boolean
    ): Promise<FeeInfo> {
        return ProxyCrossChainEvmTrade.getFeeInfo(
            fromBlockchain,
            providerAddress,
            percentFeeToken,
            useProxy
        );
    }

    protected async getRoutePath(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>
    ): Promise<RubicStep[]> {
        return [{ type: 'cross-chain', provider: this.type, path: [fromToken, toToken] }];
    }
}
