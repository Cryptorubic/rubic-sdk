import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { combineOptions } from 'src/common/utils/options';
import pTimeout from 'src/common/utils/p-timeout';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { ProviderAddress } from 'src/core/sdk/models/provider-address';
import { getPriceTokensFromInputTokens } from 'src/features/common/utils/get-price-tokens-from-input-tokens';
import { defaultProviderAddresses } from 'src/features/cross-chain/calculation-manager/constants/default-provider-addresses';
import { DeflationTokenManager } from 'src/features/deflation-token-manager/deflation-token-manager';
import { IsDeflationToken } from 'src/features/deflation-token-manager/models/is-deflation-token';
import { typedTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/typed-trade-providers';
import { OnChainManagerCalculationOptions } from 'src/features/on-chain/calculation-manager/models/on-chain-manager-calculation-options';
import { OnChainTradeError } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-error';
import { OnChainTypedTradeProviders } from 'src/features/on-chain/calculation-manager/models/on-chain-typed-trade-provider';
import { RequiredOnChainManagerCalculationOptions } from 'src/features/on-chain/calculation-manager/models/required-on-chain-manager-calculation-options';
import { EvmWrapTrade } from 'src/features/on-chain/calculation-manager/providers/common/evm-wrap-trade/evm-wrap-trade';
import {
    OnChainCalculationOptions,
    RequiredOnChainCalculationOptions
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { OnChainProxyService } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-proxy-service/on-chain-proxy-service';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/on-chain-trade';
import { OnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/on-chain-provider';
import { LifiProvider } from 'src/features/on-chain/calculation-manager/providers/lifi/lifi-provider';
import { LifiCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/lifi/models/lifi-calculation-options';
import { OpenOceanProvider } from 'src/features/on-chain/calculation-manager/providers/open-ocean/open-ocean-provider';

/**
 * Contains methods to calculate on-chain trades.
 */
export class OnChainManager {
    public static readonly defaultCalculationTimeout = 20_000;

    /**
     * List of all on-chain trade providers, combined by blockchains.
     */
    public readonly tradeProviders: OnChainTypedTradeProviders = typedTradeProviders;

    public readonly lifiProvider = new LifiProvider();

    public readonly openOceanProvider = new OpenOceanProvider();

    public readonly deflationTokenManager = new DeflationTokenManager();

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
              }
            | PriceToken,
        fromAmount: string | number,
        toToken: Token | string | PriceToken,
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

        const fullOptions = await this.getFullOptions(from, to, options);
        return this.calculateTradeFromTokens(from, to, fullOptions);
    }

    private async getFullOptions(
        from: PriceTokenAmount,
        to: PriceToken,
        options?: OnChainManagerCalculationOptions
    ): Promise<RequiredOnChainManagerCalculationOptions> {
        const chainType = BlockchainsInfo.getChainType(from.blockchain) as keyof ProviderAddress;

        const [isDeflationFrom, isDeflationTo] = await Promise.all([
            this.isDeflationToken(from),
            this.isDeflationToken(to)
        ]);
        let useProxy: boolean;
        if (options?.useProxy === false) {
            useProxy = options.useProxy;
        } else {
            useProxy =
                OnChainProxyService.isSupportedBlockchain(from.blockchain) &&
                (!isDeflationFrom.isDeflation || isDeflationFrom.isWhitelisted);
        }

        return combineOptions<RequiredOnChainManagerCalculationOptions>(
            { ...options, useProxy },
            {
                timeout: OnChainManager.defaultCalculationTimeout,
                disabledProviders: [],
                providerAddress:
                    this.providerAddress?.[chainType]?.onChain || defaultProviderAddresses.onChain,
                useProxy,
                withDeflation: {
                    from: isDeflationFrom,
                    to: isDeflationTo
                }
            }
        );
    }

    private async calculateTradeFromTokens(
        from: PriceTokenAmount,
        to: PriceToken,
        options: RequiredOnChainManagerCalculationOptions
    ): Promise<Array<OnChainTrade | OnChainTradeError>> {
        if ((from.isNative && to.isWrapped) || (from.isWrapped && to.isNative)) {
            return OnChainManager.getWrapTrade(from, to, options);
        }

        const dexesProviders = Object.entries(this.tradeProviders[from.blockchain]).filter(
            ([type]) => !options.disabledProviders.includes(type as OnChainTradeType)
        ) as [OnChainTradeType, OnChainProvider][];
        const dexesTradesPromise = this.calculateDexes(from, to, dexesProviders, options);
        const lifiTradesPromise = this.calculateLifiTrades(
            from,
            to,
            dexesProviders.map(dexProvider => dexProvider[0]),
            options
        );
        const openOceanTradePromise = this.openOceanProvider.calculate(
            from as PriceTokenAmount<EvmBlockchainName>,
            to as PriceTokenAmount<EvmBlockchainName>,
            options as RequiredOnChainCalculationOptions
        );

        const allTrades = (
            await Promise.all([dexesTradesPromise, lifiTradesPromise, openOceanTradePromise])
        ).flat();

        const filteredTrades = this.filterTradesWithBestLifiTrade(allTrades);

        return filteredTrades.sort((tradeA, tradeB) => {
            if (tradeA instanceof OnChainTrade || tradeB instanceof OnChainTrade) {
                if (tradeA instanceof OnChainTrade && tradeB instanceof OnChainTrade) {
                    return tradeA.to.tokenAmount.comparedTo(tradeB.to.tokenAmount);
                }
                return tradeA instanceof OnChainTrade ? 1 : -1;
            }
            return 0;
        });
    }

    private isDeflationToken(token: Token): Promise<IsDeflationToken> {
        return this.deflationTokenManager.isDeflationToken(token);
    }

    private async calculateDexes(
        from: PriceTokenAmount,
        to: PriceToken,
        dexesProviders: [OnChainTradeType, OnChainProvider][],
        options: RequiredOnChainManagerCalculationOptions
    ): Promise<Array<OnChainTrade | OnChainTradeError>> {
        return Promise.all(
            dexesProviders.map(async ([type, provider]) => {
                try {
                    return await pTimeout(provider.calculate(from, to, options), options.timeout);
                } catch (e) {
                    console.debug(
                        `[RUBIC_SDK] Trade calculation error occurred for ${type} trade provider.`,
                        e
                    );
                    return { type, error: e };
                }
            })
        );
    }

    private async calculateLifiTrades(
        from: PriceTokenAmount,
        to: PriceToken,
        dexesProvidersTypes: OnChainTradeType[],
        options: RequiredOnChainManagerCalculationOptions
    ): Promise<OnChainTrade[]> {
        if (!BlockchainsInfo.isEvmBlockchainName(from.blockchain)) {
            return [];
        }
        if (options.withDeflation.from.isDeflation) {
            console.debug('[RUBIC_SDK] Lifi does not work if source token is deflation.');
            return [];
        }

        try {
            const disabledProviders = dexesProvidersTypes.concat(options.disabledProviders);
            const calculationOptions: LifiCalculationOptions = {
                ...options,
                gasCalculation: options.gasCalculation === 'disabled' ? 'disabled' : 'calculate',
                disabledProviders
            };
            return await this.lifiProvider.calculate(
                from as PriceTokenAmount<EvmBlockchainName>,
                to as PriceTokenAmount<EvmBlockchainName>,
                calculationOptions
            );
        } catch (err) {
            console.debug('[RUBIC_SDK] Trade calculation error occurred for lifi.', err);
            return [];
        }
    }

    /**
     * @description Lifi-aggregator provides several providers at the same time, this method chooses the most profitable trade
     * @param trades OnChainTrade[]
     * @returns trades with only one most profitable trade by any lifi-supported provider
     */
    private filterTradesWithBestLifiTrade(
        trades: (OnChainTrade | OnChainTradeError)[]
    ): (OnChainTrade | OnChainTradeError)[] {
        const hasAvailableLifiTrades = trades.some(
            trade => trade.type === 'LIFI' && trade instanceof OnChainTrade
        );
        if (!hasAvailableLifiTrades) return trades;
        let availableLifiTrades: OnChainTrade[] = [];
        let otherTrades: (OnChainTrade | OnChainTradeError)[] = [];
        for (let i = 0; i < trades.length; i++) {
            const trade = trades[i] as OnChainTrade | OnChainTradeError;
            if (trade.type === 'LIFI' && trade instanceof OnChainTrade) {
                availableLifiTrades.push(trade);
            } else if (trade.type !== 'LIFI') {
                otherTrades.push(trade);
            }
        }
        const bestLifiTrade = availableLifiTrades.reduce((bestTrade, trade) => {
            const bestTradeAmount = bestTrade.to.tokenAmount;
            const currentTradeAmount = trade.to.tokenAmount;
            return bestTradeAmount.comparedTo(currentTradeAmount) > 0 ? bestTrade : trade;
        }, availableLifiTrades[0] as OnChainTrade);
        return [...otherTrades, bestLifiTrade];
    }

    public static getWrapTrade(
        from: PriceTokenAmount,
        to: PriceToken,
        options: OnChainCalculationOptions
    ): [EvmOnChainTrade] {
        const fromToken = from as PriceTokenAmount<EvmBlockchainName>;
        const toToken = to as PriceToken<EvmBlockchainName>;
        const trade = new EvmWrapTrade(
            {
                from: fromToken,
                to: new PriceTokenAmount<EvmBlockchainName>({
                    ...toToken.asStruct,
                    weiAmount: from.weiAmount
                }),
                slippageTolerance: 0,
                path: [from, to],
                gasFeeInfo: null,
                useProxy: false,
                proxyFeeInfo: undefined,
                fromWithoutFee: fromToken,

                withDeflation: {
                    from: { isDeflation: false },
                    to: { isDeflation: false }
                }
            },
            options.providerAddress!
        );
        return [trade];
    }
}
