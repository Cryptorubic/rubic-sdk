import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';
import { combineOptions } from '@rsdk-common/utils/options';
import pTimeout from '@rsdk-common/utils/p-timeout';
import { Mutable } from '@rsdk-common/utils/types/mutable';
import { BlockchainName } from '@rsdk-core/blockchain/models/blockchain-name';
import { PriceToken } from '@rsdk-core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '@rsdk-core/blockchain/tokens/price-token-amount';
import { Token } from '@rsdk-core/blockchain/tokens/token';
import { InstantTradeProvider } from '@rsdk-features/instant-trades/instant-trade-provider';
import { SwapManagerCalculationOptions } from '@rsdk-features/instant-trades/models/swap-manager-calculation-options';
import { TradeType } from '@rsdk-features/instant-trades/models/trade-type';
import { TypedTradeProviders } from '@rsdk-features/instant-trades/models/typed-trade-provider';
import { InstantTrade } from 'src/features';
import { MarkRequired } from 'ts-essentials';
import { getPriceTokensFromInputTokens } from '@rsdk-common/utils/tokens';
import { UniswapV2TradeProviders } from '@rsdk-features/instant-trades/constants/uniswap-v2-trade-providers';
import { UniswapV3TradeProviders } from '@rsdk-features/instant-trades/constants/uniswap-v3-trade-providers';
import { OneInchTradeProviders } from '@rsdk-features/instant-trades/constants/one-inch-trade-providers';
import { ZrxTradeProviders } from '@rsdk-features/instant-trades/constants/zrx-trade-providers';
import { AlgebraTradeProviders } from '@rsdk-features/instant-trades/constants/algebra-trade-providers';
import { EMPTY_ADDRESS } from '@rsdk-core/blockchain/constants/empty-address';
import { InstantTradeError } from 'src/features/instant-trades/models/instant-trade-error';
import { isOneInch } from 'src/features/instant-trades/utils/type-guards';
import { oneinchApiParams } from 'src/features/instant-trades/dexes/common/oneinch-common/constants';

export type RequiredSwapManagerCalculationOptions = MarkRequired<
    SwapManagerCalculationOptions,
    'timeout' | 'disabledProviders'
>;

/**
 * Contains methods to calculate instant trades.
 */
export class InstantTradesManager {
    public static readonly defaultCalculationTimeout = 3_000;

    private static getFullOptions(
        options?: SwapManagerCalculationOptions
    ): RequiredSwapManagerCalculationOptions {
        return combineOptions<RequiredSwapManagerCalculationOptions>(options, {
            timeout: InstantTradesManager.defaultCalculationTimeout,
            disabledProviders: [],
            gasCalculation: 'calculate',
            disableMultihops: false,
            slippageTolerance: 0.02,
            deadlineMinutes: 20
        });
    }

    private tradeProviders: TypedTradeProviders = [
        ...UniswapV2TradeProviders,
        ...UniswapV3TradeProviders,
        ...OneInchTradeProviders,
        ...ZrxTradeProviders,
        ...AlgebraTradeProviders
    ].reduce((acc, ProviderClass) => {
        const provider = new ProviderClass();
        acc[provider.type] = provider;
        return acc;
    }, {} as Mutable<TypedTradeProviders>);

    /**
     * List of all instant trade providers, combined by blockchains.
     */
    public readonly blockchainTradeProviders: Readonly<
        Record<BlockchainName, Partial<TypedTradeProviders>>
    > = Object.entries(this.tradeProviders).reduce(
        (acc, [type, provider]) => ({
            ...acc,
            [provider.blockchain]: { ...acc[provider.blockchain], [type]: provider }
        }),
        {} as Record<BlockchainName, Partial<TypedTradeProviders>>
    );

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
        options?: SwapManagerCalculationOptions
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
        options: RequiredSwapManagerCalculationOptions
    ): Promise<Array<InstantTrade | InstantTradeError>> {
        const { timeout, disabledProviders, ...providersOptions } = options;
        const providers = Object.entries(this.blockchainTradeProviders[from.blockchain]).filter(
            ([type]) => !disabledProviders.includes(type as TradeType)
        ) as [TradeType, InstantTradeProvider][];

        if (!providers.length) {
            throw new RubicSdkError(`There are no providers for ${from.blockchain} blockchain`);
        }

        const calculationPromises = providers.map(async ([type, provider]) => {
            try {
                const providerSpecificOptions = {
                    ...providersOptions,
                    wrappedAddress: isOneInch(type)
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
        });

        const results = await Promise.all(calculationPromises);
        return results
            .filter(notNull)
            .sort((tradeA, tradeB) => tradeA.to.tokenAmount.comparedTo(tradeB.to.tokenAmount));
    }
}
