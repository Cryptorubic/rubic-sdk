import { RubicSdkError } from '@common/errors/rubic-sdk-error';
import { notNull } from '@common/utils/object';
import { combineOptions } from '@common/utils/options';
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
import { TRADE_TYPE, TradeType } from '@features/swap/models/trade-type';
import { TypedTrade } from '@features/swap/models/typed-trade';
import { TypedTradeProviders } from '@features/swap/models/typed-trade-provider';
import BigNumber from 'bignumber.js';
import pTimeout from 'p-timeout';
import { MarkRequired } from 'ts-essentials';

type RequiredSwapManagerCalculationOptions = MarkRequired<
    SwapManagerCalculationOptions,
    'timeout' | 'disabledProviders'
>;

export class InstantTradesManager {
    public static readonly defaultCalculationTimeout = 3000;

    private readonly uniswapV2TradeProviders = {
        [TRADE_TYPE.UNISWAP_V2]: new UniSwapV2Provider(),
        [TRADE_TYPE.SUSHI_SWAP_ETHEREUM]: new SushiSwapEthereumProvider(),
        [TRADE_TYPE.PANCAKE_SWAP]: new PancakeSwapProvider(),
        [TRADE_TYPE.SUSHI_SWAP_BSC]: new SushiSwapBscProvider(),
        [TRADE_TYPE.QUICK_SWAP]: new QuickSwapProvider(),
        [TRADE_TYPE.SUSHI_SWAP_POLYGON]: new SushiSwapPolygonProvider(),
        [TRADE_TYPE.JOE]: new JoeProvider(),
        [TRADE_TYPE.PANGOLIN]: new PangolinProvider(),
        [TRADE_TYPE.SUSHI_SWAP_AVALANCHE]: new SushiSwapAvalancheProvider(),
        [TRADE_TYPE.SPIRIT_SWAP]: new SpiritSwapProvider(),
        [TRADE_TYPE.SPOOKY_SWAP]: new SpookySwapProvider(),
        [TRADE_TYPE.SUSHI_SWAP_FANTOM]: new SushiSwapFantomProvider(),
        [TRADE_TYPE.SUSHI_SWAP_HARMONY]: new SushiSwapHarmonyProvider(),
        [TRADE_TYPE.SOLAR_BEAM]: new SolarbeamProvider(),
        [TRADE_TYPE.SUSHI_SWAP_MOONRIVER]: new SushiSwapMoonriverProvider()
    } as const;

    private readonly uniswapV3TradeProviders = {
        [TRADE_TYPE.UNISWAP_V3]: new UniSwapV3Provider()
    } as const;

    private oneInchTradeProviders = {
        [TRADE_TYPE.ONE_INCH_ETHEREUM]: new OneinchEthereumProvider(),
        [TRADE_TYPE.ONE_INCH_BSC]: new OneinchBscProvider(),
        [TRADE_TYPE.ONE_INCH_POLYGON]: new OneinchPolygonProvider()
    } as const;

    private zrxTradeProviders = {
        [TRADE_TYPE.ZRX_ETHEREUM]: null as unknown as InstantTradeProvider
    } as const;

    private tradeProviders: TypedTradeProviders = {
        ...this.uniswapV2TradeProviders,
        ...this.uniswapV3TradeProviders,
        ...this.oneInchTradeProviders,
        ...this.zrxTradeProviders
    };

    private blockchainTradeProviders: Record<BLOCKCHAIN_NAME, Partial<TypedTradeProviders>> =
        Object.entries(this.tradeProviders).reduce(
            (acc, [type, provider]) => ({
                ...acc,
                [provider.blockchain]: { ...acc[provider.blockchain], [type]: provider }
            }),
            {} as Record<BLOCKCHAIN_NAME, Partial<TypedTradeProviders>>
        );

    public async calculateTrade(
        from:
            | Token
            | {
                  address: string;
                  blockchain: BLOCKCHAIN_NAME;
              },
        fromAmount: string,
        to: Token | string,
        options?: SwapManagerCalculationOptions
    ) {
        const fromPriceTokenPromise =
            from instanceof Token ? PriceToken.createFromToken(from) : PriceToken.createToken(from);

        const toPriceTokenPromise =
            to instanceof Token
                ? PriceToken.createFromToken(to)
                : PriceToken.createToken({ address: to, blockchain: from.blockchain });

        const [fromPriceToken, toPriceToken] = await Promise.all([
            fromPriceTokenPromise,
            toPriceTokenPromise
        ]);

        if (fromPriceToken.blockchain !== toPriceToken.blockchain) {
            throw new RubicSdkError('Blockchains of from and to tokens must be same.');
        }

        const fromPriceTokenAmount = new PriceTokenAmount({
            ...fromPriceToken.asStruct,
            tokenAmount: new BigNumber(fromAmount)
        });

        return this.calculateTradeFromTokens(
            fromPriceTokenAmount,
            toPriceToken,
            this.getFullOptions(options)
        );
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
    ): Promise<TypedTrade[]> {
        const { timeout, disabledProviders, ...providersOptions } = options;
        const providers = Object.entries(this.blockchainTradeProviders[from.blockchain]).filter(
            ([type]) => !disabledProviders.includes(type as TradeType)
        ) as [TradeType, InstantTradeProvider][];

        if (!providers.length) {
            throw new RubicSdkError(`There are no providers for ${from.blockchain} blockchain`);
        }

        const calculationPromises = providers.map(async ([type, provider]) => {
            try {
                const trade = await pTimeout(
                    provider.calculate(from, to, providersOptions),
                    timeout
                );
                return {
                    trade,
                    type
                };
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
