import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/on-chain-trade';
import { RubicSdkError } from 'src/common/errors';
import { OnChainTradeError } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-error';
import { OnChainManagerCalculationOptions } from 'src/features/on-chain/calculation-manager/models/on-chain-manager-calculation-options';
import { LifiProvider } from 'src/features/on-chain/calculation-manager/providers/lifi/lifi-provider';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { OnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/on-chain-provider';
import { oneinchApiParams } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/constants';
import { OnChainTypedTradeProviders } from 'src/features/on-chain/calculation-manager/models/on-chain-typed-trade-provider';
import pTimeout from 'src/common/utils/p-timeout';
import { MarkRequired } from 'ts-essentials';
import { combineOptions } from 'src/common/utils/options';
import { typedTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/typed-trade-providers';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { getPriceTokensFromInputTokens } from 'src/features/common/utils/get-price-tokens-from-input-tokens';
import { ProviderAddress } from 'src/core/sdk/models/provider-address';

type RequiredOnChainManagerCalculationOptions = MarkRequired<
    OnChainManagerCalculationOptions,
    'timeout' | 'disabledProviders' | 'providerAddress'
>;

/**
 * Contains methods to calculate on-chain trades.
 */
export class OnChainManager {
    public static readonly defaultCalculationTimeout = 10_000;

    /**
     * List of all on-chain trade providers, combined by blockchains.
     */
    public readonly tradeProviders: OnChainTypedTradeProviders = typedTradeProviders;

    public readonly lifiProvider = new LifiProvider();

    public constructor(private readonly providerAddress: ProviderAddress) {}

    /**
     * Calculates on-chain trades, sorted by output amount.
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
     * const trades = await sdk.onChainManager.calculateTrade(
     *     { blockchain, address: fromTokenAddress },
     *     fromAmount,
     *     toTokenAddress
     * );
     * const bestTrade = trades[0];
     *
     * trades.forEach(trade => {
     *     if (trade instanceof OnChainTrade) {
     *         console.log(trade.type, `to amount: ${trade.to.tokenAmount.toFormat(3)}`)
     *     }
     * })
     * ```
     *
     * @param fromToken Token to sell.
     * @param fromAmount Amount to sell.
     * @param toToken Token to get.
     * @param options Additional options.
     * @returns List of calculated on-chain trades.
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
        options?: OnChainManagerCalculationOptions
    ): Promise<Array<OnChainTrade | OnChainTradeError>> {
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
            this.getFullOptions(from.blockchain, options)
        );
    }

    private getFullOptions(
        fromBlockchain: BlockchainName,
        options?: OnChainManagerCalculationOptions
    ): RequiredOnChainManagerCalculationOptions {
        const chainType = BlockchainsInfo.getChainType(fromBlockchain) as keyof ProviderAddress;
        return combineOptions<RequiredOnChainManagerCalculationOptions>(options, {
            timeout: OnChainManager.defaultCalculationTimeout,
            disabledProviders: [],
            providerAddress: this.providerAddress[chainType]
        });
    }

    private async calculateTradeFromTokens(
        from: PriceTokenAmount,
        to: PriceToken,
        options: RequiredOnChainManagerCalculationOptions
    ): Promise<Array<OnChainTrade | OnChainTradeError>> {
        const { timeout, disabledProviders, ...providersOptions } = options;
        const providers = Object.entries(this.tradeProviders[from.blockchain]).filter(
            ([type]) => !disabledProviders.includes(type as OnChainTradeType)
        ) as [OnChainTradeType, OnChainProvider][];

        const onChainTradesPromise = Promise.all(
            providers.map(async ([type, provider]) => {
                try {
                    const providerSpecificOptions = {
                        ...providersOptions,
                        wrappedAddress:
                            type === ON_CHAIN_TRADE_TYPE.ONE_INCH
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
            onChainTradesPromise,
            lifiTradesPromise
        ]);
        const trades = lifiTrades ? instantTrades.concat(lifiTrades) : instantTrades;

        return trades.sort((tradeA, tradeB) => {
            if (tradeA instanceof OnChainTrade || tradeB instanceof OnChainTrade) {
                if (tradeA instanceof OnChainTrade && tradeB instanceof OnChainTrade) {
                    return tradeA.to.tokenAmount.comparedTo(tradeB.to.tokenAmount);
                }
                if (tradeA instanceof OnChainTrade) {
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
        providers: OnChainTradeType[],
        options: RequiredOnChainManagerCalculationOptions
    ): Promise<OnChainTrade[]> {
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
                gasCalculation: options.gasCalculation === 'disabled' ? 'disabled' : 'calculate',
                providerAddress: options.providerAddress
            }
        );
    }
}
