import { Token } from '@core/blockchain/tokens/token';
import { BlockchainName } from '@core/blockchain/models/blockchain-name';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { notNull } from '@common/utils/object';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { RubicSdkError } from '@common/errors/rubic-sdk.error';
import { combineOptions } from '@common/utils/options';
import { getPriceTokensFromInputTokens } from '@common/utils/tokens';
import { Mutable } from '@common/utils/types/mutable';
import { CelerCrossChainTradeProvider } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-trade-provider';
import { CcrTypedTradeProviders } from '@features/cross-chain/models/typed-trade-provider';
import {
    CelerCrossChainTrade,
    CROSS_CHAIN_TRADE_TYPE,
    CrossChainTrade,
    CrossChainTradeType,
    SymbiosisCrossChainTrade
} from 'src/features';
import { SwapManagerCrossChainCalculationOptions } from '@features/cross-chain/models/swap-manager-cross-chain-options';
import pTimeout from '@common/utils/p-timeout';
import { CrossChainTradeProvider } from '@features/cross-chain/providers/common/cross-chain-trade-provider';
import { hasLengthAtLeast } from '@features/instant-trades/utils/type-guards';
import { WrappedCrossChainTrade } from '@features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import BigNumber from 'bignumber.js';
import { SymbiosisCrossChainTradeProvider } from '@features/cross-chain/providers/symbiosis-trade-provider/symbiosis-cross-chain-trade-provider';
import { RubicCrossChainTradeProvider } from './providers/rubic-trade-provider/rubic-cross-chain-trade-provider';

type RequiredSwapManagerCalculationOptions = Required<SwapManagerCrossChainCalculationOptions>;

/**
 * Contains method to calculate best cross chain trade.
 */
export class CrossChainManager {
    private static readonly defaultCalculationTimeout = 15_000;

    private static readonly defaultSlippageTolerance = 0.02;

    private static readonly defaultDeadline = 20;

    private tradeProviders: CcrTypedTradeProviders = [
        RubicCrossChainTradeProvider,
        CelerCrossChainTradeProvider,
        SymbiosisCrossChainTradeProvider
    ].reduce((acc, ProviderClass) => {
        const provider = new ProviderClass();
        acc[provider.type] = provider;
        return acc;
    }, {} as Mutable<CcrTypedTradeProviders>);

    constructor(private readonly providerAddress: string) {}

    /**
     * Calculates best cross chain trade, based on calculated courses.
     * @param fromToken Token to sell.
     * @param fromAmount Amount to sell.
     * @param toToken Token to get.
     * @param options Additional options.
     * @returns Wrapped cross chain trade, with possible min or max amount errors.
     */
    public async calculateTrade(
        fromToken:
            | Token
            | {
                  address: string;
                  blockchain: BlockchainName;
              },
        fromAmount: string | number,
        toToken:
            | Token
            | {
                  address: string;
                  blockchain: BlockchainName;
              },
        options?: Omit<SwapManagerCrossChainCalculationOptions, 'providerAddress'>
    ): Promise<WrappedCrossChainTrade> {
        if (toToken instanceof Token && fromToken.blockchain === toToken.blockchain) {
            throw new RubicSdkError('Blockchains of from and to tokens must be different.');
        }

        const { from, to } = await getPriceTokensFromInputTokens(
            fromToken,
            fromAmount.toString(),
            toToken
        );

        return this.calculateBestTradeFromTokens(from, to, this.getFullOptions(options));
    }

    private getFullOptions(
        options?: SwapManagerCrossChainCalculationOptions
    ): RequiredSwapManagerCalculationOptions {
        return combineOptions(options, {
            fromSlippageTolerance: CrossChainManager.defaultSlippageTolerance,
            toSlippageTolerance: CrossChainManager.defaultSlippageTolerance,
            gasCalculation: 'enabled',
            disabledProviders: [],
            timeout: CrossChainManager.defaultCalculationTimeout,
            providerAddress: this.providerAddress,
            slippageTolerance: CrossChainManager.defaultSlippageTolerance * 2,
            deadline: CrossChainManager.defaultDeadline,
            fromAddress: ''
        });
    }

    private async calculateBestTradeFromTokens(
        from: PriceTokenAmount,
        to: PriceToken,
        options: RequiredSwapManagerCalculationOptions
    ): Promise<WrappedCrossChainTrade> {
        const wrappedTrades = await this.calculateTradeFromTokens(
            from,
            to,
            this.getFullOptions(options)
        );
        if (!hasLengthAtLeast(wrappedTrades, 1)) {
            throw new Error('[RUBIC SDK] Trades array has to be defined');
        }

        const transitTokenAmount = (
            wrappedTrades.find(wrappedTrade => wrappedTrade.trade instanceof CelerCrossChainTrade)
                ?.trade as CelerCrossChainTrade
        )?.fromTrade.toToken.tokenAmount;
        const sortedTrades = wrappedTrades.sort((firstTrade, secondTrade) => {
            const firstTradeAmount = this.getProviderRatio(firstTrade.trade, transitTokenAmount);
            const secondTradeAmount = this.getProviderRatio(secondTrade.trade, transitTokenAmount);

            return firstTradeAmount.comparedTo(secondTradeAmount);
        });

        const filteredTrades = sortedTrades.filter(
            trade => !trade?.minAmountError && !trade?.maxAmountError
        );
        if (filteredTrades.length) {
            return {
                trade: filteredTrades[0]!.trade!
            };
        }

        let minAmountError: BigNumber | undefined;
        let maxAmountError: BigNumber | undefined;
        sortedTrades.forEach(trade => {
            if (trade.minAmountError) {
                minAmountError = minAmountError
                    ? BigNumber.min(minAmountError, trade.minAmountError)
                    : trade.minAmountError;
            }
            if (trade.maxAmountError) {
                maxAmountError = maxAmountError
                    ? BigNumber.max(maxAmountError, trade.maxAmountError)
                    : trade.maxAmountError;
            }
        });

        return {
            trade: sortedTrades[0].trade,
            minAmountError,
            maxAmountError
        };
    }

    private getProviderRatio(trade: CrossChainTrade | null, transitTokenAmount: BigNumber) {
        if (!trade) {
            return new BigNumber(Infinity);
        }

        if (trade instanceof SymbiosisCrossChainTrade) {
            return transitTokenAmount.dividedBy(trade.to.tokenAmount);
        }

        return transitTokenAmount
            .plus((trade as CelerCrossChainTrade).cryptoFeeToken.price)
            .dividedBy(trade.to.tokenAmount);
    }

    private async calculateTradeFromTokens(
        from: PriceTokenAmount,
        to: PriceToken,
        options: RequiredSwapManagerCalculationOptions
    ): Promise<WrappedCrossChainTrade[]> {
        const { disabledProviders, timeout, ...providersOptions } = options;
        const providers = Object.entries(this.tradeProviders).filter(([type]) => {
            if (disabledProviders.includes(type as CrossChainTradeType)) {
                return false;
            }

            if (
                type === CROSS_CHAIN_TRADE_TYPE.RUBIC &&
                CelerCrossChainTradeProvider.isSupportedBlockchain(from.blockchain) &&
                CelerCrossChainTradeProvider.isSupportedBlockchain(to.blockchain)
            ) {
                return false;
            }

            return true;
        }) as [CrossChainTradeType, CrossChainTradeProvider][];

        if (!providers.length) {
            throw new RubicSdkError(`There are no providers for trade`);
        }

        const calculationPromises = providers.map(async ([type, provider]) => {
            try {
                const calculation = provider.calculate(from, to, providersOptions);
                return await pTimeout(calculation, timeout);
            } catch (e) {
                console.debug(
                    `[RUBIC_SDK] Trade calculation error occurred for ${type} trade provider.`,
                    e
                );
                return null;
            }
        });
        const results = (await Promise.all(calculationPromises)).filter(notNull);
        if (!results?.length) {
            throw new Error('[RUBIC_SDK] No success providers calculation for the trade.');
        }
        return results;
    }
}
