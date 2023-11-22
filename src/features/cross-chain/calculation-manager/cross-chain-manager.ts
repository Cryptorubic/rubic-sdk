import BigNumber from 'bignumber.js';
import { from, map, merge, Observable, startWith, switchMap } from 'rxjs';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { notNull } from 'src/common/utils/object';
import { combineOptions } from 'src/common/utils/options';
import pTimeout from 'src/common/utils/p-timeout';
import { Mutable } from 'src/common/utils/types';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { ProviderAddress } from 'src/core/sdk/models/provider-address';
import {
    ProxySupportedBlockchain,
    proxySupportedBlockchains
} from 'src/features/common/constants/proxy-supported-blockchain';
import { getPriceTokensFromInputTokens } from 'src/features/common/utils/get-price-tokens-from-input-tokens';
import { CrossChainProviders } from 'src/features/cross-chain/calculation-manager/constants/cross-chain-providers';
import { defaultCrossChainCalculationOptions } from 'src/features/cross-chain/calculation-manager/constants/default-cross-chain-calculation-options';
import { defaultProviderAddresses } from 'src/features/cross-chain/calculation-manager/constants/default-provider-addresses';
import {
    CrossChainManagerCalculationOptions,
    RequiredCrossChainManagerCalculationOptions
} from 'src/features/cross-chain/calculation-manager/models/cross-chain-manager-options';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CrossChainReactivelyCalculatedTradeData } from 'src/features/cross-chain/calculation-manager/models/cross-chain-reactively-calculated-trade-data';
import {
    CROSS_CHAIN_TRADE_TYPE,
    CrossChainTradeType
} from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainTypedTradeProviders } from 'src/features/cross-chain/calculation-manager/models/cross-chain-typed-trade-provider';
import { WrappedCrossChainTradeOrNull } from 'src/features/cross-chain/calculation-manager/models/wrapped-cross-chain-trade-or-null';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { WrappedCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/models/wrapped-cross-chain-trade';
import { compareCrossChainTrades } from 'src/features/cross-chain/calculation-manager/utils/compare-cross-chain-trades';

/**
 * Contains method to calculate best cross-chain trade.
 */
export class CrossChainManager {
    public readonly tradeProviders: CrossChainTypedTradeProviders = CrossChainProviders.reduce(
        (acc, ProviderClass) => {
            const provider = new ProviderClass();
            acc[provider.type] = provider;
            return acc;
        },
        {} as Mutable<CrossChainTypedTradeProviders>
    );

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
              }
            | PriceToken,
        fromAmount: string | number | BigNumber,
        toToken:
            | Token
            | {
                  address: string;
                  blockchain: BlockchainName;
              }
            | PriceToken,
        options?: CrossChainManagerCalculationOptions
    ): Promise<WrappedCrossChainTrade[]> {
        if (toToken instanceof Token && fromToken.blockchain === toToken.blockchain) {
            throw new RubicSdkError('Blockchains of `from` and `to` tokens must be different.');
        }

        const { from, to } = await getPriceTokensFromInputTokens(fromToken, fromAmount, toToken);
        const { disabledProviders, ...providerOptions } = this.getFullOptions(
            from.blockchain,
            options
        );

        const providers = this.getNotDisabledProviders(
            from.blockchain,
            to.blockchain,
            disabledProviders
        );

        const calculationPromises = providers.map(provider =>
            this.getProviderCalculationPromise(provider, from, to, providerOptions)
        );
        const wrappedTrades = (await Promise.all(calculationPromises)).filter(notNull);
        if (!wrappedTrades?.length) {
            throw new RubicSdkError('No success providers calculation for the trade');
        }

        return wrappedTrades.sort((nextTrade, prevTrade) =>
            compareCrossChainTrades(nextTrade, prevTrade)
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
     *     console.log(tradeData.total) // 3
     *     console.log(tradeData.calculated) // 0 or 1 ... or tradeData.total
     *
     *     const wrappedTrade = tradeData.wrappedTrade;
     *     if (wrappedTrade) {
     *         console.log(wrappedTrade.tradeType, `to amount: ${wrappedTrade.trade.to.tokenAmount.toFormat(3)}`));
     *         if (wrappedTrade.error) {
     *             console.error(wrappedTrade.tradeType, 'error: wrappedTrade.error');
     *         }
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
              }
            | PriceToken,
        fromAmount: string | number | BigNumber,
        toToken:
            | Token
            | {
                  address: string;
                  blockchain: BlockchainName;
              }
            | PriceToken,
        options?: CrossChainManagerCalculationOptions
    ): Observable<CrossChainReactivelyCalculatedTradeData> {
        if (toToken instanceof Token && fromToken.blockchain === toToken.blockchain) {
            throw new RubicSdkError('Blockchains of from and to tokens must be different.');
        }

        return from(getPriceTokensFromInputTokens(fromToken, fromAmount, toToken)).pipe(
            switchMap(({ from, to }) => {
                const { disabledProviders, ...providerOptions } = this.getFullOptions(
                    from.blockchain,
                    options
                );

                const providers = this.getNotDisabledProviders(
                    from.blockchain,
                    to.blockchain,
                    disabledProviders
                );
                const totalTrades = providers.length;

                return merge(
                    ...providers.map(provider =>
                        fromPromise(
                            this.getProviderCalculationPromise(provider, from, to, providerOptions)
                        )
                    )
                ).pipe(
                    map((wrappedTrade, index) => {
                        return {
                            total: totalTrades,
                            calculated: index + 1,
                            wrappedTrade
                        };
                    }),
                    startWith({
                        total: totalTrades,
                        calculated: 0,
                        wrappedTrade: null
                    })
                );
            })
        );
    }

    private getFullOptions(
        fromBlockchain: BlockchainName,
        options?: CrossChainManagerCalculationOptions
    ): RequiredCrossChainManagerCalculationOptions {
        const providerAddress = options?.providerAddress
            ? options.providerAddress
            : this.getProviderAddress(fromBlockchain);
        const useProxy = this.getProxyConfig(fromBlockchain, options);

        return combineOptions(
            { ...options, useProxy },
            {
                ...defaultCrossChainCalculationOptions,
                providerAddress,
                useProxy
            }
        );
    }

    private getNotDisabledProviders(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName,
        disabledProviders: CrossChainTradeType[]
    ): CrossChainProvider[] {
        const providers = (
            Object.entries(this.tradeProviders) as [CrossChainTradeType, CrossChainProvider][]
        )
            .filter(([type, provider]) => {
                if (disabledProviders.includes(type)) {
                    return false;
                }

                return provider.areSupportedBlockchains(fromBlockchain, toBlockchain);
            })
            .map(([_type, provider]) => provider);
        if (!providers.length) {
            throw new RubicSdkError(`There are no providers for trade`);
        }

        return providers;
    }

    private async getProviderCalculationPromise(
        provider: CrossChainProvider,
        from: PriceTokenAmount,
        to: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<WrappedCrossChainTradeOrNull> {
        try {
            const wrappedTrade = await pTimeout(
                provider.calculate(from, to, options),
                options.timeout
            );
            if (!wrappedTrade) {
                return null;
            }

            return {
                ...wrappedTrade,
                tradeType: provider.type
            };
        } catch (err: unknown) {
            console.debug(
                `[RUBIC_SDK] Trade calculation error occurred for ${provider.type} trade provider.`,
                err
            );
            return {
                trade: null,
                tradeType: provider.type,
                error: CrossChainProvider.parseError(err)
            };
        }
    }

    private getProviderAddress(fromBlockchain: BlockchainName): string {
        let chainType: keyof ProviderAddress | undefined;
        try {
            chainType = BlockchainsInfo.getChainType(fromBlockchain) as keyof ProviderAddress;
        } catch {}

        let providerAddress = defaultProviderAddresses.crossChain;
        if (
            chainType &&
            this.providerAddress?.[chainType]?.crossChain &&
            this.providerAddress[chainType]!.crossChain !== undefined
        ) {
            providerAddress = this.providerAddress[chainType]!.crossChain!;
        }
        return providerAddress;
    }

    private getProxyConfig(
        fromBlockchain: BlockchainName,
        options: CrossChainManagerCalculationOptions | undefined
    ) {
        const isBlockchainSupportedByProxy = proxySupportedBlockchains.includes(
            fromBlockchain as ProxySupportedBlockchain
        );
        return Object.fromEntries(
            Object.values(CROSS_CHAIN_TRADE_TYPE).map(key => {
                return [
                    key,
                    isBlockchainSupportedByProxy
                        ? options?.useProxy?.[key as CrossChainTradeType] ?? true
                        : false
                ];
            })
        ) as Record<CrossChainTradeType, boolean>;
    }
}
