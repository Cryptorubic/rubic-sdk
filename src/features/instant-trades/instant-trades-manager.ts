import { RubicSdkError } from '@common/errors/rubic-sdk.error';
import { notNull } from '@common/utils/object';
import { combineOptions } from '@common/utils/options';
import pTimeout from '@common/utils/p-timeout';
import { Mutable } from '@common/utils/types/mutable';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Token } from '@core/blockchain/tokens/token';
import { JoeProvider } from '@features/instant-trades/dexes/avalanche/joe/joe-provider';
import { PangolinProvider } from '@features/instant-trades/dexes/avalanche/pangolin/pangolin-provider';
import { SushiSwapAvalancheProvider } from '@features/instant-trades/dexes/avalanche/sushi-swap-avalanche/sushi-swap-avalanche-provider';
import { OneinchBscProvider } from '@features/instant-trades/dexes/bsc/oneinch-bsc/oneinch-bsc-provider';
import { PancakeSwapProvider } from '@features/instant-trades/dexes/bsc/pancake-swap/pancake-swap-provider';
import { SushiSwapBscProvider } from '@features/instant-trades/dexes/bsc/sushi-swap-bsc/sushi-swap-bsc-provider';
import { OneinchEthereumProvider } from '@features/instant-trades/dexes/ethereum/oneinch-ethereum/oneinch-ethereum-provider';
import { SushiSwapEthereumProvider } from '@features/instant-trades/dexes/ethereum/sushi-swap-ethereum/sushi-swap-ethereum-provider';
import { UniSwapV2EthereumProvider } from '@features/instant-trades/dexes/ethereum/uni-swap-v2-ethereum/uni-swap-v2-ethereum-provider';
import { UniSwapV3EthereumProvider } from '@features/instant-trades/dexes/ethereum/uni-swap-v3-ethereum/uni-swap-v3-ethereum-provider';
import { SpiritSwapProvider } from '@features/instant-trades/dexes/fantom/spirit-swap/spirit-swap-provider';
import { SpookySwapProvider } from '@features/instant-trades/dexes/fantom/spooky-swap/spooky-swap-provider';
import { SushiSwapFantomProvider } from '@features/instant-trades/dexes/fantom/sushi-swap-fantom/sushi-swap-fantom-provider';
import { SushiSwapHarmonyProvider } from '@features/instant-trades/dexes/harmony/sushi-swap-harmony/sushi-swap-harmony-provider';
import { SolarbeamProvider } from '@features/instant-trades/dexes/moonriver/solarbeam/solarbeam-provider';
import { SushiSwapMoonriverProvider } from '@features/instant-trades/dexes/moonriver/sushi-swap-moonriver/sushi-swap-moonriver-provider';
import { OneinchPolygonProvider } from '@features/instant-trades/dexes/polygon/oneinch-polygon/oneinch-polygon-provider';
import { QuickSwapProvider } from '@features/instant-trades/dexes/polygon/quick-swap/quick-swap-provider';
import { SushiSwapPolygonProvider } from '@features/instant-trades/dexes/polygon/sushi-swap-polygon/sushi-swap-polygon-provider';
import { InstantTradeProvider } from '@features/instant-trades/instant-trade-provider';
import { SwapManagerCalculationOptions } from '@features/instant-trades/models/swap-manager-calculation-options';
import { TradeType } from '@features/instant-trades/models/trade-type';
import { TypedTradeProviders } from '@features/instant-trades/models/typed-trade-provider';
import { InstantTrade } from 'src/features';
import { MarkRequired } from 'ts-essentials';
import { ZrxEthereumProvider } from '@features/instant-trades/dexes/ethereum/zrx-ethereum/zrx-ethereum-provider';
import { getPriceTokensFromInputTokens } from '@common/utils/tokens';
import { AlgebraProvider } from '@features/instant-trades/dexes/polygon/algebra/algebra-provider';
import { UniSwapV3PolygonProvider } from '@features/instant-trades/dexes/polygon/uni-swap-v3-polygon/uni-swap-v3-polygon-provider';
import { ViperSwapHarmonyProvider } from '@features/instant-trades/dexes/harmony/viper-swap-harmony/viper-swap-harmony-provider';
import { OneinchArbitrumProvider } from '@features/instant-trades/dexes/arbitrum/oneinch-arbitrum/oneinch-arbitrum-provider';
import { SushiSwapArbitrumProvider } from '@features/instant-trades/dexes/arbitrum/sushi-swap-arbitrum/sushi-swap-arbitrum-provider';
import { UniSwapV3ArbitrumProvider } from '@features/instant-trades/dexes/arbitrum/uni-swap-v3-arbitrum/uni-swap-v3-arbitrum-provider';
import { TrisolarisAuroraProvider } from '@features/instant-trades/dexes/aurora/trisolaris-aurora/trisolaris-aurora-provider';
import { WannaSwapAuroraProvider } from '@features/instant-trades/dexes/aurora/wanna-swap-aurora/wanna-swap-aurora-provider';

type RequiredSwapManagerCalculationOptions = MarkRequired<
    SwapManagerCalculationOptions,
    'timeout' | 'disabledProviders'
>;

export class InstantTradesManager {
    public static readonly defaultCalculationTimeout = 3_000;

    private readonly uniswapV2TradeProviders = [
        // ethereum
        UniSwapV2EthereumProvider,
        SushiSwapEthereumProvider,
        // bsc
        PancakeSwapProvider,
        SushiSwapBscProvider,
        // polygon
        QuickSwapProvider,
        SushiSwapPolygonProvider,
        // avalanche
        JoeProvider,
        PangolinProvider,
        SushiSwapAvalancheProvider,
        // moonriver
        SolarbeamProvider,
        SushiSwapMoonriverProvider,
        // fantom
        SpiritSwapProvider,
        SpookySwapProvider,
        SushiSwapFantomProvider,
        // harmony
        SushiSwapHarmonyProvider,
        ViperSwapHarmonyProvider,
        // arbitrum
        OneinchArbitrumProvider,
        SushiSwapArbitrumProvider,
        UniSwapV3ArbitrumProvider,
        // aurora
        TrisolarisAuroraProvider,
        WannaSwapAuroraProvider
    ] as const;

    private readonly uniswapV3TradeProviders = [
        UniSwapV3EthereumProvider,
        UniSwapV3PolygonProvider
    ] as const;

    private oneInchTradeProviders = [
        OneinchEthereumProvider,
        OneinchBscProvider,
        OneinchPolygonProvider
    ] as const;

    private zrxTradeProviders = [ZrxEthereumProvider] as const;

    private algebraTradeProviders = [AlgebraProvider] as const;

    private tradeProviders: TypedTradeProviders = [
        ...this.uniswapV2TradeProviders,
        ...this.uniswapV3TradeProviders,
        ...this.oneInchTradeProviders,
        ...this.zrxTradeProviders,
        ...this.algebraTradeProviders
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
