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
import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from 'src/features';
import { SwapManagerCrossChainCalculationOptions } from '@features/cross-chain/models/swap-manager-cross-chain-options';
import pTimeout from '@common/utils/p-timeout';
import { CrossChainTradeProvider } from '@features/cross-chain/providers/common/cross-chain-trade-provider';
import { hasLengthAtLeast } from '@features/instant-trades/utils/type-guards';
import { WrappedCrossChainTrade } from '@features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import BigNumber from 'bignumber.js';
import { SymbiosisCrossChainTradeProvider } from '@features/cross-chain/providers/symbiosis-trade-provider/symbiosis-cross-chain-trade-provider';
import { RubicCrossChainTradeProvider } from './providers/rubic-trade-provider/rubic-cross-chain-trade-provider';

type RequiredSwapManagerCalculationOptions = Required<SwapManagerCrossChainCalculationOptions>;

export class CrossChainManager {
    public static readonly defaultCalculationTimeout = 360_000;

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
        options?: SwapManagerCrossChainCalculationOptions
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
        const trades = await this.calculateTradeFromTokens(from, to, this.getFullOptions(options));
        if (!hasLengthAtLeast(trades, 1)) {
            throw new Error('[RUBIC SDK] Trades array has to be defined');
        }

        const sortedTrades = trades.sort((firstTrade, secondTrade) => {
            const firstTradeAmount = firstTrade.trade?.to?.tokenAmount || new BigNumber(0);
            const secondTradeAmount = secondTrade.trade?.to?.tokenAmount || new BigNumber(0);

            return secondTradeAmount.comparedTo(firstTradeAmount);
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
