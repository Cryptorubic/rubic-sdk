import { LifiCrossChainTrade } from 'src/features/cross-chain/providers/lifi-provider/lifi-cross-chain-trade';
import { WrappedCrossChainTrade } from 'src/features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { LifiCrossChainProvider } from 'src/features/cross-chain/providers/lifi-provider/lifi-cross-chain-provider';
import { MaxAmountError, RubicSdkError, MinAmountError } from 'src/common/errors';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/models/cross-chain-options';
import { CrossChainManagerCalculationOptions } from 'src/features/cross-chain/models/cross-chain-manager-options';
import { DebridgeCrossChainProvider } from 'src/features/cross-chain/providers/debridge-provider/debridge-cross-chain-provider';
import { CelerCrossChainProvider } from 'src/features/cross-chain/providers/celer-provider/celer-cross-chain-provider';
import { DebridgeCrossChainTrade } from 'src/features/cross-chain/providers/debridge-provider/debridge-cross-chain-trade';
import { from as fromPromise, map, merge, mergeMap, Observable, of, switchMap } from 'rxjs';
import { RangoCrossChainTrade } from 'src/features/cross-chain/providers/rango-provider/rango-cross-chain-trade';
import { RangoCrossChainProvider } from 'src/features/cross-chain/providers/rango-provider/rango-cross-chain-provider';
import { CelerCrossChainTrade } from 'src/features/cross-chain/providers/celer-provider/celer-cross-chain-trade';
import { CrossChainProviderData } from 'src/features/cross-chain/models/cross-chain-provider-data';
import { SymbiosisCrossChainTrade } from 'src/features/cross-chain/providers/symbiosis-provider/symbiosis-cross-chain-trade';
import { getPriceTokensFromInputTokens } from 'src/common/utils/tokens';
import { CrossChainTypedTradeProviders } from 'src/features/cross-chain/models/cross-chain-typed-trade-provider';
import { WrappedTradeOrNull } from 'src/features/cross-chain/providers/common/models/wrapped-trade-or-null';
import { notNull } from 'src/common/utils/object';
import { SymbiosisCrossChainProvider } from 'src/features/cross-chain/providers/symbiosis-provider/symbiosis-cross-chain-provider';
import { CrossChainTradeType } from 'src/features/cross-chain/models/cross-chain-trade-type';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { Mutable } from 'src/common/utils/types';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { ViaCrossChainProvider } from 'src/features/cross-chain/providers/via-provider/via-cross-chain-provider';
import { ViaCrossChainTrade } from 'src/features/cross-chain/providers/via-provider/via-cross-chain-trade';
import pTimeout from 'src/common/utils/p-timeout';
import { MarkRequired } from 'ts-essentials';
import { CrossChainProvider } from 'src/features/cross-chain/providers/common/cross-chain-provider';
import { combineOptions } from 'src/common/utils/options';
import BigNumber from 'bignumber.js';
import { BridgersCrossChainProvider } from 'src/features/cross-chain/providers/bridgers-provider/bridgers-cross-chain-provider';
import { ProviderAddress } from 'src/core/sdk/models/provider-address';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { BitgertCrossChainProvider } from './providers/bitgert-provider/bitgert-cross-chain-provider';

type RequiredCrossChainManagerCalculationOptions = MarkRequired<
    CrossChainManagerCalculationOptions,
    'disabledProviders'
> &
    RequiredCrossChainOptions;

/**
 * Contains method to calculate best cross-chain trade.
 */
export class CrossChainManager {
    private static readonly defaultCalculationTimeout = 25_000;

    private static readonly defaultSlippageTolerance = 0.02;

    private static readonly defaultDeadline = 20;

    public readonly tradeProviders: CrossChainTypedTradeProviders = [
        CelerCrossChainProvider,
        SymbiosisCrossChainProvider,
        LifiCrossChainProvider,
        DebridgeCrossChainProvider,
        RangoCrossChainProvider,
        ViaCrossChainProvider,
        BridgersCrossChainProvider,
        BitgertCrossChainProvider
    ].reduce((acc, ProviderClass) => {
        const provider = new ProviderClass();
        acc[provider.type] = provider;
        return acc;
    }, {} as Mutable<CrossChainTypedTradeProviders>);

    constructor(private readonly providerAddress: ProviderAddress) {}

    /**
     * Calculates cross-chain trades and sorts them by exchange courses.
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
     * const wrappedTrades = await sdk.crossChainManager.calculateTrade(
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
     * @returns Array of sorted wrapped cross-chain trades with possible errors.
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
        options?: CrossChainManagerCalculationOptions
    ): Promise<WrappedCrossChainTrade[]> {
        if (toToken instanceof Token && fromToken.blockchain === toToken.blockchain) {
            throw new RubicSdkError('Blockchains of from and to tokens must be different.');
        }

        const { from, to } = await getPriceTokensFromInputTokens(
            fromToken,
            fromAmount.toString(),
            toToken
        );

        return this.calculateBestTradeFromTokens(
            from,
            to,
            this.getFullOptions(from.blockchain, options)
        );
    }

    /**
     * Calculates cross-chain trades reactively in sequence.
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
     * @returns Observable of cross-chain providers calculation data with best trade and possible errors.
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
        options?: CrossChainManagerCalculationOptions
    ): Observable<CrossChainProviderData> {
        if (toToken instanceof Token && fromToken.blockchain === toToken.blockchain) {
            throw new RubicSdkError('Blockchains of from and to tokens must be different.');
        }
        return fromPromise(
            getPriceTokensFromInputTokens(fromToken, fromAmount.toString(), toToken)
        ).pipe(
            switchMap(tokens => {
                const { from, to } = tokens;
                const { disabledProviders, ...providersOptions } = this.getFullOptions(
                    from.blockchain,
                    options
                );

                const providers = Object.entries(this.tradeProviders).filter(([type, provider]) => {
                    if (disabledProviders.includes(type as CrossChainTradeType)) {
                        return false;
                    }

                    return provider.isSupportedBlockchains(from.blockchain, to.blockchain);
                }) as [CrossChainTradeType, CrossChainProvider][];

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
                        providers.map(async ([type, provider]) => {
                            const promise = provider.calculate(from, to, providersOptions);
                            try {
                                const wrappedTrade = await pTimeout(
                                    promise,
                                    providersOptions.timeout
                                );

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
                        console.log(wrappedTrade);
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
     * @param nextWrappedTrade New trade to compare.
     * @param prevWrappedTrade Old trade to compare.
     */
    private chooseBestProvider(
        nextWrappedTrade: WrappedTradeOrNull,
        prevWrappedTrade: WrappedTradeOrNull
    ): WrappedTradeOrNull {
        if (
            prevWrappedTrade?.error instanceof MinAmountError &&
            nextWrappedTrade?.error instanceof MinAmountError
        ) {
            return prevWrappedTrade.error.minAmount.lte(nextWrappedTrade.error.minAmount)
                ? prevWrappedTrade
                : nextWrappedTrade;
        }
        if (
            prevWrappedTrade?.error instanceof MaxAmountError &&
            nextWrappedTrade?.error instanceof MaxAmountError
        ) {
            return prevWrappedTrade.error.maxAmount.gte(nextWrappedTrade.error.maxAmount)
                ? prevWrappedTrade
                : nextWrappedTrade;
        }

        if (!prevWrappedTrade || prevWrappedTrade.error) {
            return nextWrappedTrade;
        }

        if (!nextWrappedTrade || nextWrappedTrade.error) {
            return prevWrappedTrade;
        }

        const prevTrade = prevWrappedTrade.trade;
        let fromUsd: BigNumber;
        if (prevTrade instanceof CelerCrossChainTrade) {
            fromUsd = prevTrade.fromTrade.toToken.tokenAmount;
        } else if (
            prevTrade instanceof DebridgeCrossChainTrade ||
            prevTrade instanceof SymbiosisCrossChainTrade
        ) {
            fromUsd = prevTrade.transitAmount;
        } else if (
            prevTrade instanceof LifiCrossChainTrade ||
            prevTrade instanceof ViaCrossChainTrade ||
            prevTrade instanceof RangoCrossChainTrade
        ) {
            fromUsd = prevTrade.from.price.multipliedBy(prevTrade.from.tokenAmount);
        } else {
            throw new RubicSdkError('Not supported trade');
        }

        const prevTradeRatio = prevWrappedTrade?.trade?.getTradeAmountRatio(fromUsd);
        const nextTradeRatio = nextWrappedTrade?.trade?.getTradeAmountRatio(fromUsd);

        if (!nextTradeRatio) {
            return prevWrappedTrade;
        }

        if (!prevTradeRatio) {
            return nextWrappedTrade;
        }

        return prevTradeRatio.lte(nextTradeRatio) ? prevWrappedTrade : nextWrappedTrade;
    }

    private getFullOptions(
        fromBlockchain: BlockchainName,
        options?: CrossChainManagerCalculationOptions
    ): RequiredCrossChainManagerCalculationOptions {
        const chainType = BlockchainsInfo.getChainType(fromBlockchain) as keyof ProviderAddress;
        return combineOptions<RequiredCrossChainManagerCalculationOptions>(options, {
            fromSlippageTolerance: CrossChainManager.defaultSlippageTolerance,
            toSlippageTolerance: CrossChainManager.defaultSlippageTolerance,
            gasCalculation: 'disabled',
            disabledProviders: [],
            timeout: CrossChainManager.defaultCalculationTimeout,
            providerAddress: this.providerAddress[chainType],
            slippageTolerance: CrossChainManager.defaultSlippageTolerance * 2,
            deadline: CrossChainManager.defaultDeadline
        });
    }

    private async calculateBestTradeFromTokens(
        from: PriceTokenAmount,
        to: PriceToken,
        options: RequiredCrossChainManagerCalculationOptions
    ): Promise<WrappedCrossChainTrade[]> {
        const wrappedTrades = await this.calculateTradeFromTokens(from, to, options);

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
        options: RequiredCrossChainManagerCalculationOptions
    ): Promise<WrappedCrossChainTrade[]> {
        const { disabledProviders, ...providersOptions } = options;
        const providers = Object.entries(this.tradeProviders).filter(
            ([type]) => !disabledProviders.includes(type as CrossChainTradeType)
        ) as [CrossChainTradeType, CrossChainProvider][];

        if (!providers.length) {
            throw new RubicSdkError(`There are no providers for trade`);
        }

        const calculationPromises = providers.map(async ([type, provider]) => {
            try {
                const calculation = provider.calculate(from, to, providersOptions);
                const wrappedTrade = await pTimeout(calculation, providersOptions.timeout);
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
                    error: CrossChainProvider.parseError(err)
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
