import { Token } from '@rsdk-core/blockchain/tokens/token';
import { BlockchainName } from '@rsdk-core/blockchain/models/blockchain-name';
import { PriceTokenAmount } from '@rsdk-core/blockchain/tokens/price-token-amount';
import { notNull } from '@rsdk-common/utils/object';
import { PriceToken } from '@rsdk-core/blockchain/tokens/price-token';
import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';
import { combineOptions } from '@rsdk-common/utils/options';
import { getPriceTokensFromInputTokens } from '@rsdk-common/utils/tokens';
import { Mutable } from '@rsdk-common/utils/types/mutable';
import { CelerCrossChainTradeProvider } from '@rsdk-features/cross-chain/providers/celer-trade-provider/celer-cross-chain-trade-provider';
import { CcrTypedTradeProviders } from '@rsdk-features/cross-chain/models/typed-trade-provider';
import { CelerCrossChainTrade, CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from 'src/features';
import { SwapManagerCrossChainCalculationOptions } from '@rsdk-features/cross-chain/models/swap-manager-cross-chain-options';
import pTimeout from '@rsdk-common/utils/p-timeout';
import { CrossChainTradeProvider } from '@rsdk-features/cross-chain/providers/common/cross-chain-trade-provider';
import { WrappedCrossChainTrade } from '@rsdk-features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import BigNumber from 'bignumber.js';
import { MarkRequired } from 'ts-essentials';
import { RequiredCrossChainOptions } from '@rsdk-features/cross-chain/models/cross-chain-options';
import { from as fromPromise, map, merge, mergeMap, Observable, of, switchMap } from 'rxjs';
import { CrossChainProviderData } from 'src/features/cross-chain/providers/common/models/cross-chain-provider-data';
import { SymbiosisCrossChainTradeProvider } from 'src/features/cross-chain/providers/symbiosis-trade-provider/symbiosis-cross-chain-trade-provider';
import { LifiCrossChainTrade } from 'src/features/cross-chain/providers/lifi-trade-provider/lifi-cross-chain-trade';
import { WrappedTradeOrNull } from 'src/features/cross-chain/providers/common/models/wrapped-trade-or-null';
import { CrossChainMinAmountError } from 'src/common/errors/cross-chain/cross-chain-min-amount.error';
import { CrossChainMaxAmountError } from 'src/common/errors/cross-chain/cross-chain-max-amount.error';
import { DebridgeCrossChainTradeProvider } from 'src/features/cross-chain/providers/debridge-trade-provider/debridge-cross-chain-trade-provider';
import { RubicCrossChainTradeProvider } from './providers/rubic-trade-provider/rubic-cross-chain-trade-provider';
import { LifiCrossChainTradeProvider } from './providers/lifi-trade-provider/lifi-cross-chain-trade-provider';

type RequiredSwapManagerCalculationOptions = MarkRequired<
    SwapManagerCrossChainCalculationOptions,
    'timeout' | 'disabledProviders'
> &
    RequiredCrossChainOptions;

/**
 * Contains method to calculate best cross chain trade.
 */
export class CrossChainManager {
    private static readonly defaultCalculationTimeout = 20_000;

    private static readonly defaultSlippageTolerance = 0.02;

    private static readonly defaultDeadline = 20;

    public readonly tradeProviders: CcrTypedTradeProviders = [
        RubicCrossChainTradeProvider,
        CelerCrossChainTradeProvider,
        SymbiosisCrossChainTradeProvider,
        LifiCrossChainTradeProvider,
        DebridgeCrossChainTradeProvider
    ].reduce((acc, ProviderClass) => {
        const provider = new ProviderClass();
        acc[provider.type] = provider;
        return acc;
    }, {} as Mutable<CcrTypedTradeProviders>);

    constructor(private readonly providerAddress: string) {}

    /**
     * Calculates cross chain trades and sorts them by exchange courses.
     * Wrapped trade object may contain error, but sometimes course can be
     * calculated even with thrown error (e.g. min/max amount error).
     *
     * @example
     * ```ts
     * const fromBlockchain = BLOCKCHAIN_NAME.ETHEREUM;
     * // ETH
     * const fromTokenAddress = '0x0000000000000000000000000000000000000000';
     * const fromAmount = 1;
     * const toBlockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;
     * // BUSD
     * const toTokenAddress = '0xe9e7cea3dedca5984780bafc599bd69add087d56';
     *
     * const wrappedTrades = await sdk.crossChain.calculateTrade(
     *     { blockchain: fromBlockchain, address: fromTokenAddress },
     *     fromAmount,
     *     { blockchain: toBlockchain, address: toTokenAddress }
     * );
     * const bestTrade = wrappedTrades[0];
     *
     * wrappedTrades.forEach(wrappedTrade => {
     *    if (wrappedTrade.trade) {
     *        console.log(wrappedTrade.tradeType, `to amount: ${wrappedTrade.trade.to.tokenAmount.toFormat(3)}`));
     *    }
     *    if (wrappedTrade.error) {
     *        console.error(wrappedTrade.tradeType, 'error: wrappedTrade.error');
     *    }
     * });
     *
     * ```
     *
     * @param fromToken Token to sell.
     * @param fromAmount Amount to sell.
     * @param toToken Token to get.
     * @param options Additional options.
     * @returns Array of sorted wrapped cross chain trades with possible errors.
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
    ): Promise<WrappedCrossChainTrade[]> {
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

    /**
     * Calculates cross chain trades reactively in sequence.
     * Contains wrapped trade object which may contain error, but sometimes course can be
     * calculated even with thrown error (e.g. min/max amount error).
     *
     * @example
     * ```ts
     * const fromBlockchain = BLOCKCHAIN_NAME.ETHEREUM;
     * // ETH
     * const fromTokenAddress = '0x0000000000000000000000000000000000000000';
     * const fromAmount = 1;
     * const toBlockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;
     * // BUSD
     * const toTokenAddress = '0xe9e7cea3dedca5984780bafc599bd69add087d56';
     *
     * sdk.crossChain.calculateTrade(
     *     { blockchain: fromBlockchain, address: fromTokenAddress },
     *     fromAmount,
     *     { blockchain: toBlockchain, address: toTokenAddress }
     * ).subscribe(tradeData => {
     *     console.log(tradeData.totalProviders) // 3
     *     console.log(tradeData.calculatedProviders) // 0 -> 1 -> ... -> totalProviders
     *      if (tradeData.bestTrade.trade) {
     *        console.log(wrappedTrade.tradeType, `to amount: ${wrappedTrade.trade.to.tokenAmount.toFormat(3)}`));
     *    }
     *    if (tradeData.bestTrade.error) {
     *        console.error(wrappedTrade.tradeType, 'error: wrappedTrade.error');
     *    }
     * });
     *
     * ```
     *
     * @param fromToken Token to sell.
     * @param fromAmount Amount to sell.
     * @param toToken Token to get.
     * @param options Additional options.
     * @returns Observable of cross chain providers calculation data with best trade and possible errors.
     */
    public calculateTradesReactively(
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
    ): Observable<CrossChainProviderData> {
        if (toToken instanceof Token && fromToken.blockchain === toToken.blockchain) {
            throw new RubicSdkError('Blockchains of from and to tokens must be different.');
        }
        return fromPromise(
            getPriceTokensFromInputTokens(fromToken, fromAmount.toString(), toToken)
        ).pipe(
            switchMap(tokens => {
                const { from, to } = tokens;
                const { disabledProviders, timeout, ...providersOptions } =
                    this.getFullOptions(options);

                const providers = Object.entries(this.tradeProviders).filter(([type]) => {
                    if (disabledProviders.includes(type as CrossChainTradeType)) {
                        return false;
                    }

                    return !(
                        type === CROSS_CHAIN_TRADE_TYPE.RUBIC &&
                        CelerCrossChainTradeProvider.isSupportedBlockchain(from.blockchain) &&
                        CelerCrossChainTradeProvider.isSupportedBlockchain(to.blockchain)
                    );
                }) as [CrossChainTradeType, CrossChainTradeProvider][];

                const providerData: CrossChainProviderData = {
                    bestProvider: null,
                    totalProviders: providers.length,
                    calculatedProviders: -1,
                    allProviders: []
                };

                if (!providers.length) {
                    throw new RubicSdkError(`There are no providers for trade`);
                }

                const tradeObservable$ = merge(
                    of(
                        pTimeout(
                            new Promise<WrappedTradeOrNull>(resolve => resolve(null)),
                            Infinity
                        )
                    ),
                    fromPromise(
                        providers.map(async ([type, trade]) => {
                            const promise = trade.calculate(from, to, providersOptions);
                            try {
                                const wrappedTrade = await pTimeout(promise, timeout);

                                if (!wrappedTrade) {
                                    return null;
                                }

                                return {
                                    ...wrappedTrade,
                                    tradeType: type
                                };
                            } catch (err) {
                                return {
                                    trade: null,
                                    tradeType: type,
                                    error: err
                                };
                            }
                        })
                    )
                );

                return tradeObservable$.pipe(
                    mergeMap(el => el),
                    map(wrappedTrade => {
                        providerData.calculatedProviders += 1;
                        providerData.bestProvider = this.chooseBestProvider(
                            wrappedTrade,
                            providerData.bestProvider
                        );
                        providerData.allProviders = wrappedTrade
                            ? [...providerData.allProviders, wrappedTrade]
                            : providerData.allProviders;

                        return providerData;
                    })
                );
            })
        );
    }

    /**
     * Choose the best provider between two trades.
     * @param newTrade New trade to compare.
     * @param oldTrade Old trade to compare.
     */
    private chooseBestProvider(
        newTrade: WrappedTradeOrNull,
        oldTrade: WrappedTradeOrNull
    ): WrappedTradeOrNull {
        if (
            oldTrade?.error instanceof CrossChainMinAmountError &&
            newTrade?.error instanceof CrossChainMinAmountError
        ) {
            return oldTrade.error.minAmount.lte(newTrade.error.minAmount) ? oldTrade : newTrade;
        }
        if (
            oldTrade?.error instanceof CrossChainMaxAmountError &&
            newTrade?.error instanceof CrossChainMaxAmountError
        ) {
            return oldTrade.error.maxAmount.gte(newTrade.error.maxAmount) ? oldTrade : newTrade;
        }

        if (!oldTrade || oldTrade.error) {
            return newTrade;
        }

        if (!newTrade || newTrade.error) {
            return oldTrade;
        }

        const oldTradeRatio = oldTrade?.trade?.getTradeAmountRatio();
        const newTradeRatio = newTrade?.trade?.getTradeAmountRatio();

        if (!newTradeRatio) {
            return oldTrade;
        }

        if (!oldTradeRatio) {
            return newTrade;
        }

        return oldTradeRatio.lte(newTradeRatio) ? oldTrade : newTrade;
    }

    private getFullOptions(
        options?: SwapManagerCrossChainCalculationOptions
    ): RequiredSwapManagerCalculationOptions {
        return combineOptions<RequiredSwapManagerCalculationOptions>(options, {
            fromSlippageTolerance: CrossChainManager.defaultSlippageTolerance,
            toSlippageTolerance: CrossChainManager.defaultSlippageTolerance,
            gasCalculation: 'disabled',
            disabledProviders: [],
            timeout: CrossChainManager.defaultCalculationTimeout,
            providerAddress: this.providerAddress,
            slippageTolerance: CrossChainManager.defaultSlippageTolerance * 2,
            deadline: CrossChainManager.defaultDeadline
        });
    }

    private async calculateBestTradeFromTokens(
        from: PriceTokenAmount,
        to: PriceToken,
        options: RequiredSwapManagerCalculationOptions
    ): Promise<WrappedCrossChainTrade[]> {
        const wrappedTrades = await this.calculateTradeFromTokens(
            from,
            to,
            this.getFullOptions(options)
        );

        const fromTokenPrice =
            (
                wrappedTrades.find(
                    wrappedTrade => wrappedTrade.trade instanceof LifiCrossChainTrade
                )?.trade as LifiCrossChainTrade
            )?.from.price ||
            (
                wrappedTrades.find(
                    wrappedTrade => wrappedTrade.trade instanceof CelerCrossChainTrade
                )?.trade as CelerCrossChainTrade
            )?.fromTrade.toToken.tokenAmount;

        if (!fromTokenPrice) {
            return wrappedTrades.sort(tradeA => (tradeA?.trade ? -1 : 1));
        }
        return wrappedTrades.sort((firstTrade, secondTrade) => {
            const firstTradeRatio = this.getProviderRatio(firstTrade, fromTokenPrice);
            const secondTradeRatio = this.getProviderRatio(secondTrade, fromTokenPrice);

            return firstTradeRatio.comparedTo(secondTradeRatio);
        });
    }

    private getProviderRatio(wrappedTrade: WrappedCrossChainTrade, fromTokenPrice: BigNumber) {
        const { trade } = wrappedTrade;

        if (!trade || !fromTokenPrice || wrappedTrade.error) {
            return new BigNumber(Infinity);
        }

        if (trade instanceof CelerCrossChainTrade) {
            return fromTokenPrice
                .plus(trade.cryptoFeeToken.price.multipliedBy(trade.cryptoFeeToken.tokenAmount))
                .dividedBy(trade.to.tokenAmount);
        }

        return fromTokenPrice.dividedBy(trade.to.tokenAmount);
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
                const wrappedTrade = await pTimeout(calculation, timeout);
                if (!wrappedTrade) {
                    return null;
                }

                return {
                    ...wrappedTrade,
                    tradeType: provider.type
                };
            } catch (err: unknown) {
                console.debug(
                    `[RUBIC_SDK] Trade calculation error occurred for ${type} trade provider.`,
                    err
                );
                return {
                    trade: null,
                    tradeType: provider.type,
                    error: CrossChainTradeProvider.parseError(err)
                };
            }
        });
        const results = (await Promise.all(calculationPromises)).filter(notNull);
        if (!results?.length) {
            throw new RubicSdkError('No success providers calculation for the trade');
        }
        return results;
    }
}
