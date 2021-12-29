import { RubicSdkError } from '@common/errors/rubic-sdk.error';
import { notNull } from '@common/utils/object';
import { combineOptions } from '@common/utils/options';
import { Mutable } from '@common/utils/types/mutable';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Token } from '@core/blockchain/tokens/token';
import { JoeProvider } from '@features/swap/dexes/avalanche/joe/joe-provider';
import { PangolinProvider } from '@features/swap/dexes/avalanche/pangolin/pangolin-provider';
import { SushiSwapAvalancheProvider } from '@features/swap/dexes/avalanche/sushi-swap-avalanche/sushi-swap-avalanche-provider';
import { OneinchBscProvider } from '@features/swap/dexes/bsc/oneinch-bsc/oneinch-bsc-provider';
import { PancakeSwapProvider } from '@features/swap/dexes/bsc/pancake-swap/pancake-swap-provider';
import { SushiSwapBscProvider } from '@features/swap/dexes/bsc/sushi-swap-bsc/sushi-swap-bsc-provider';
import { OneinchEthereumProvider } from '@features/swap/dexes/ethereum/oneinch-ethereum/oneinch-ethereum-provider';
import { SushiSwapEthereumProvider } from '@features/swap/dexes/ethereum/sushi-swap-ethereum/sushi-swap-ethereum-provider';
import { UniSwapV2Provider } from '@features/swap/dexes/ethereum/uni-swap-v2/uni-swap-v2-provider';
import { UniSwapV3Provider } from '@features/swap/dexes/ethereum/uni-swap-v3/uni-swap-v3-provider';
import { SpiritSwapProvider } from '@features/swap/dexes/fantom/spirit-swap/spirit-swap-provider';
import { SpookySwapProvider } from '@features/swap/dexes/fantom/spooky-swap/spooky-swap-provider';
import { SushiSwapFantomProvider } from '@features/swap/dexes/fantom/sushi-swap-fantom/sushi-swap-fantom-provider';
import { SushiSwapHarmonyProvider } from '@features/swap/dexes/harmony/sushi-swap-harmony/sushi-swap-harmony-provider';
import { SolarbeamProvider } from '@features/swap/dexes/moonriver/solarbeam/solarbeam-provider';
import { SushiSwapMoonriverProvider } from '@features/swap/dexes/moonriver/sushi-swap-moonriver/sushi-swap-moonriver-provider';
import { OneinchPolygonProvider } from '@features/swap/dexes/polygon/oneinch-polygon/oneinch-polygon-provider';
import { QuickSwapProvider } from '@features/swap/dexes/polygon/quick-swap/quick-swap-provider';
import { SushiSwapPolygonProvider } from '@features/swap/dexes/polygon/sushi-swap-polygon/sushi-swap-polygon-provider';
import { InstantTradeProvider } from '@features/swap/instant-trade-provider';
import { SwapManagerCalculationOptions } from '@features/swap/models/swap-manager-calculation-options';
import { TradeType } from '@features/swap/models/trade-type';
import { TypedTradeProviders } from '@features/swap/models/typed-trade-provider';
import pTimeout from 'p-timeout';
import { InstantTrade } from 'src/features';
import { MarkRequired } from 'ts-essentials';
import { ZrxEthereumProvider } from '@features/swap/dexes/ethereum/zrx-ethereum/zrx-ethereum-provider';
import { getPriceTokensFromInputTokens } from '@common/utils/tokens';

type RequiredSwapManagerCalculationOptions = MarkRequired<
    SwapManagerCalculationOptions,
    'timeout' | 'disabledProviders'
>;

export class InstantTradesManager {
    public static readonly defaultCalculationTimeout = 3000;

    private readonly uniswapV2TradeProviders = [
        UniSwapV2Provider,
        SushiSwapEthereumProvider,
        PancakeSwapProvider,
        SushiSwapBscProvider,
        QuickSwapProvider,
        SushiSwapPolygonProvider,
        JoeProvider,
        PangolinProvider,
        SushiSwapAvalancheProvider,
        SpiritSwapProvider,
        SpookySwapProvider,
        SushiSwapFantomProvider,
        SushiSwapHarmonyProvider,
        SolarbeamProvider,
        SushiSwapMoonriverProvider
    ] as const;

    private readonly uniswapV3TradeProviders = [UniSwapV3Provider] as const;

    private oneInchTradeProviders = [
        OneinchEthereumProvider,
        OneinchBscProvider,
        OneinchPolygonProvider
    ] as const;

    private zrxTradeProviders = [ZrxEthereumProvider] as const;

    private tradeProviders: TypedTradeProviders = [
        ...this.uniswapV2TradeProviders,
        ...this.uniswapV3TradeProviders,
        ...this.oneInchTradeProviders,
        ...this.zrxTradeProviders
    ].reduce((acc, ProviderClass) => {
        const provider = new ProviderClass();
        acc[provider.type] = provider;
        return acc;
    }, {} as Mutable<TypedTradeProviders>);

    public readonly blockchainTradeProviders: Readonly<
        Record<BLOCKCHAIN_NAME, Partial<TypedTradeProviders>>
    > = Object.entries(this.tradeProviders).reduce(
        (acc, [type, provider]) => ({
            ...acc,
            [provider.blockchain]: { ...acc[provider.blockchain], [type]: provider }
        }),
        {} as Record<BLOCKCHAIN_NAME, Partial<TypedTradeProviders>>
    );

    public async calculateTrade(
        fromToken:
            | Token
            | {
                  address: string;
                  blockchain: BLOCKCHAIN_NAME;
              },
        fromAmount: string | number,
        toToken: Token | string,
        options?: SwapManagerCalculationOptions
    ): Promise<InstantTrade[]> {
        if (toToken instanceof Token && fromToken.blockchain !== toToken.blockchain) {
            throw new RubicSdkError('Blockchains of from and to tokens must be same.');
        }

        const { from, to } = await getPriceTokensFromInputTokens(
            fromToken,
            fromAmount.toString(),
            toToken
        );

        return this.calculateTradeFromTokens(from, to, this.getFullOptions(options));
    }

    private getFullOptions(
        options?: SwapManagerCalculationOptions
    ): RequiredSwapManagerCalculationOptions {
        return combineOptions(options, {
            timeout: InstantTradesManager.defaultCalculationTimeout,
            disabledProviders: [] as TradeType[]
        });
    }

    private async calculateTradeFromTokens(
        from: PriceTokenAmount,
        to: PriceToken,
        options: RequiredSwapManagerCalculationOptions
    ): Promise<InstantTrade[]> {
        const { timeout, disabledProviders, ...providersOptions } = options;
        const providers = Object.entries(this.blockchainTradeProviders[from.blockchain]).filter(
            ([type]) => !disabledProviders.includes(type as TradeType)
        ) as [TradeType, InstantTradeProvider][];

        if (!providers.length) {
            throw new RubicSdkError(`There are no providers for ${from.blockchain} blockchain`);
        }

        const calculationPromises = providers.map(async ([type, provider]) => {
            try {
                return await pTimeout(provider.calculate(from, to, providersOptions), timeout);
            } catch (e) {
                console.debug(
                    `[RUBIC_SDK] Trade calculation error occurred for ${type} trade provider.`,
                    e
                );
                return null;
            }
        });

        const results = await Promise.all(calculationPromises);
        return results.filter(notNull);
    }
}
