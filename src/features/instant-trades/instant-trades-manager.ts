import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { InstantTrade } from 'src/features/instant-trades/providers/abstract/instant-trade';
import { RubicSdkError } from 'src/common/errors';
import { InstantTradeError } from 'src/features/instant-trades/models/instant-trade-error';
import { getPriceTokensFromInputTokens } from 'src/common/utils/tokens';
import { ManagerCalculationOptions } from 'src/features/instant-trades/models/manager-calculation-options';
import { LifiProvider } from 'src/features/instant-trades/providers/lifi/lifi-provider';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { TRADE_TYPE, TradeType } from 'src/features/instant-trades/providers/models/trade-type';
import { InstantTradeProvider } from 'src/features/instant-trades/providers/dexes/abstract/instant-trade-provider/instant-trade-provider';
import { oneinchApiParams } from 'src/features/instant-trades/providers/dexes/abstract/oneinch-abstract/constants';
import { TypedTradeProviders } from 'src/features/instant-trades/models/typed-trade-provider';
import pTimeout from 'src/common/utils/p-timeout';
import { MarkRequired } from 'ts-essentials';
import { combineOptions } from 'src/common/utils/options';
import { typedTradeProviders } from 'src/features/instant-trades/constants/trade-providers/typed-trade-providers';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';

export type RequiredManagerCalculationOptions = MarkRequired<
    ManagerCalculationOptions,
    'timeout' | 'disabledProviders'
>;

/**
 * Contains methods to calculate instant trades.
 */
export class InstantTradesManager {
    public static readonly defaultCalculationTimeout = 10_000;

    private static getFullOptions(
        options?: ManagerCalculationOptions
    ): RequiredManagerCalculationOptions {
        return combineOptions<RequiredManagerCalculationOptions>(options, {
            timeout: InstantTradesManager.defaultCalculationTimeout,
            disabledProviders: []
        });
    }

    /**
     * List of all instant trade providers, combined by blockchains.
     */
    public readonly tradeProviders: TypedTradeProviders = typedTradeProviders;

    public readonly lifiProvider = new LifiProvider();

    /**
     * Calculates instant trades, sorted by output amount.
     *
     * @example
     * ```ts
     * const blockchain = BLOCKCHAIN_NAME.ETHEREUM;
     * // ETH
     * const fromTokenAddress = '0x0000000000000000000000000000000000000000';
     * const fromAmount = 1;
     * // USDT
     * const toTokenAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
     *
     * const trades = await sdk.instantTrades.calculateTrade(
     *     { blockchain, address: fromTokenAddress },
     *     fromAmount,
     *     toTokenAddress
     * );
     * const bestTrade = trades[0];
     *
     * Object.entries(trades).forEach(([tradeType, trade]) =>
     *     console.log(tradeType, `to amount: ${trade.to.tokenAmount.toFormat(3)}`)
     * )
     * ```
     *
     * @param fromToken Token to sell.
     * @param fromAmount Amount to sell.
     * @param toToken Token to get.
     * @param options Additional options.
     * @returns List of calculated instant trades.
     */
    public async calculateTrade(
        fromToken:
            | Token
            | {
                  address: string;
                  blockchain: BlockchainName;
              },
        fromAmount: string | number,
        toToken: Token | string,
        options?: ManagerCalculationOptions
    ): Promise<Array<InstantTrade | InstantTradeError>> {
        if (toToken instanceof Token && fromToken.blockchain !== toToken.blockchain) {
            throw new RubicSdkError('Blockchains of from and to tokens must be same');
        }

        const { from, to } = await getPriceTokensFromInputTokens(
            fromToken,
            fromAmount.toString(),
            toToken
        );

        return this.calculateTradeFromTokens(
            from,
            to,
            InstantTradesManager.getFullOptions(options)
        );
    }

    private async calculateTradeFromTokens(
        from: PriceTokenAmount,
        to: PriceToken,
        options: RequiredManagerCalculationOptions
    ): Promise<Array<InstantTrade | InstantTradeError>> {
        const { timeout, disabledProviders, ...providersOptions } = options;
        const providers = Object.entries(this.tradeProviders[from.blockchain]).filter(
            ([type]) => !disabledProviders.includes(type as TradeType)
        ) as [TradeType, InstantTradeProvider][];

        const instantTradesPromise = Promise.all(
            providers.map(async ([type, provider]) => {
                try {
                    const providerSpecificOptions = {
                        ...providersOptions,
                        wrappedAddress:
                            type === TRADE_TYPE.ONE_INCH
                                ? oneinchApiParams.nativeAddress
                                : providersOptions.wrappedAddress
                    };
                    return await pTimeout(
                        provider.calculate(from, to, providerSpecificOptions),
                        timeout
                    );
                } catch (e) {
                    console.debug(
                        `[RUBIC_SDK] Trade calculation error occurred for ${type} trade provider.`,
                        e
                    );
                    return { type, error: e };
                }
            })
        );
        const lifiTradesPromise = (async () => {
            try {
                return await this.calculateLifiTrades(
                    from,
                    to,
                    providers.map(provider => provider[0]),
                    options
                );
            } catch (e) {
                console.debug(`[RUBIC_SDK] Trade calculation error occurred for lifi.`, e);
                return null;
            }
        })();

        const [instantTrades, lifiTrades] = await Promise.all([
            instantTradesPromise,
            lifiTradesPromise
        ]);
        const trades = lifiTrades ? instantTrades.concat(lifiTrades) : instantTrades;

        return trades.sort((tradeA, tradeB) => {
            if (tradeA instanceof InstantTrade || tradeB instanceof InstantTrade) {
                if (tradeA instanceof InstantTrade && tradeB instanceof InstantTrade) {
                    return tradeA.to.tokenAmount.comparedTo(tradeB.to.tokenAmount);
                }
                if (tradeA instanceof InstantTrade) {
                    return 1;
                }
                return -1;
            }
            return 0;
        });
    }

    private async calculateLifiTrades(
        from: PriceTokenAmount,
        to: PriceToken,
        providers: TradeType[],
        options: RequiredManagerCalculationOptions
    ): Promise<InstantTrade[]> {
        if (!BlockchainsInfo.isEvmBlockchainName(from.blockchain)) {
            return [];
        }

        const disabledProviders = providers.concat(options.disabledProviders);

        return this.lifiProvider.calculate(
            from as PriceTokenAmount<EvmBlockchainName>,
            to as PriceTokenAmount<EvmBlockchainName>,
            disabledProviders,
            {
                slippageTolerance: options.slippageTolerance,
                gasCalculation: options.gasCalculation === 'disabled' ? 'disabled' : 'calculate'
            }
        );
    }
}
