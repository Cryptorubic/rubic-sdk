import { JoeProvider } from 'src/features/instant-trades/providers/dexes/avalanche/joe/joe-provider';
import { SushiSwapEthereumProvider } from 'src/features/instant-trades/providers/dexes/ethereum/sushi-swap-ethereum/sushi-swap-ethereum-provider';
import { UniSwapV3EthereumProvider } from 'src/features/instant-trades/providers/dexes/ethereum/uni-swap-v3-ethereum/uni-swap-v3-ethereum-provider';
import { OneinchArbitrumProvider } from 'src/features/instant-trades/providers/dexes/arbitrum/oneinch-arbitrum/oneinch-arbitrum-provider';
import { SushiSwapArbitrumProvider } from 'src/features/instant-trades/providers/dexes/arbitrum/sushi-swap-arbitrum/sushi-swap-arbitrum-provider';
import { SpookySwapProvider } from 'src/features/instant-trades/providers/dexes/fantom/spooky-swap/spooky-swap-provider';
import { ZappyProvider } from 'src/features/instant-trades/providers/dexes/telos/zappy/trisolaris-aurora-provider';
import { OneinchEthereumProvider } from 'src/features/instant-trades/providers/dexes/ethereum/oneinch-ethereum/oneinch-ethereum-provider';
import { OneinchBscProvider } from 'src/features/instant-trades/providers/dexes/bsc/oneinch-bsc/oneinch-bsc-provider';
import { QuickSwapProvider } from 'src/features/instant-trades/providers/dexes/polygon/quick-swap/quick-swap-provider';
import { OneinchPolygonProvider } from 'src/features/instant-trades/providers/dexes/polygon/oneinch-polygon/oneinch-polygon-provider';
import { WannaSwapAuroraProvider } from 'src/features/instant-trades/providers/dexes/aurora/wanna-swap-aurora/wanna-swap-aurora-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { TrisolarisAuroraProvider } from 'src/features/instant-trades/providers/dexes/aurora/trisolaris-aurora/trisolaris-aurora-provider';
import { SolarbeamProvider } from 'src/features/instant-trades/providers/dexes/moonriver/solarbeam/solarbeam-provider';
import { UniSwapV2EthereumProvider } from 'src/features/instant-trades/providers/dexes/ethereum/uni-swap-v2-ethereum/uni-swap-v2-ethereum-provider';
import { PangolinProvider } from 'src/features/instant-trades/providers/dexes/avalanche/pangolin/pangolin-provider';
import { OneinchAvalancheProvider } from 'src/features/instant-trades/providers/dexes/avalanche/oneinch-avalanche/oneinch-avalanche-provider';
import { AlgebraProvider } from 'src/features/instant-trades/providers/dexes/polygon/algebra/algebra-provider';
import { SushiSwapPolygonProvider } from 'src/features/instant-trades/providers/dexes/polygon/sushi-swap-polygon/sushi-swap-polygon-provider';
import { SushiSwapAvalancheProvider } from 'src/features/instant-trades/providers/dexes/avalanche/sushi-swap-avalanche/sushi-swap-avalanche-provider';
import { SushiSwapTelosProvider } from 'src/features/instant-trades/providers/dexes/telos/sushi-swap-telos/sushi-swap-telos-provider';
import { SushiSwapMoonriverProvider } from 'src/features/instant-trades/providers/dexes/moonriver/sushi-swap-moonriver/sushi-swap-moonriver-provider';
import { PancakeSwapProvider } from 'src/features/instant-trades/providers/dexes/bsc/pancake-swap/pancake-swap-provider';
import { SushiSwapBscProvider } from 'src/features/instant-trades/providers/dexes/bsc/sushi-swap-bsc/sushi-swap-bsc-provider';
import { ViperSwapHarmonyProvider } from 'src/features/instant-trades/providers/dexes/harmony/viper-swap-harmony/viper-swap-harmony-provider';
import { DeepReadonly } from 'ts-essentials';
import { InstantTradeProvider } from 'src/features/instant-trades/providers/dexes/abstract/instant-trade-provider/instant-trade-provider';
import { OneinchFantomProvider } from 'src/features/instant-trades/providers/dexes/fantom/oneinch-fantom/oneinch-fantom-provider';
import { SpiritSwapProvider } from 'src/features/instant-trades/providers/dexes/fantom/spirit-swap/spirit-swap-provider';
import { UniSwapV3PolygonProvider } from 'src/features/instant-trades/providers/dexes/polygon/uni-swap-v3-polygon/uni-swap-v3-polygon-provider';
import { SushiSwapHarmonyProvider } from 'src/features/instant-trades/providers/dexes/harmony/sushi-swap-harmony/sushi-swap-harmony-provider';
import { UniSwapV3ArbitrumProvider } from 'src/features/instant-trades/providers/dexes/arbitrum/uni-swap-v3-arbitrum/uni-swap-v3-arbitrum-provider';
import { SushiSwapFantomProvider } from 'src/features/instant-trades/providers/dexes/fantom/sushi-swap-fantom/sushi-swap-fantom-provider';

/**
 * Stores contracts info.
 * Every contract may have several instant-trade providers.
 * Because of that every provider has `method suffix` - suffix
 * to add to default swap-method name to call that provider's method.
 */
export const crossChainTradeProvidersData: DeepReadonly<
    Record<string, { ProviderClass: typeof InstantTradeProvider; methodSuffix: string }[]>
> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: [
        {
            ProviderClass: UniSwapV2EthereumProvider,
            methodSuffix: ''
        },
        {
            ProviderClass: SushiSwapEthereumProvider,
            methodSuffix: '1'
        },
        {
            ProviderClass: UniSwapV3EthereumProvider,
            methodSuffix: 'V3'
        },
        {
            ProviderClass: OneinchEthereumProvider,
            methodSuffix: 'Inch'
        }
    ],
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
        {
            ProviderClass: PancakeSwapProvider,
            methodSuffix: ''
        },
        {
            ProviderClass: SushiSwapBscProvider,
            methodSuffix: '1'
        },
        {
            ProviderClass: OneinchBscProvider,
            methodSuffix: 'Inch'
        }
    ],
    [BLOCKCHAIN_NAME.POLYGON]: [
        {
            ProviderClass: QuickSwapProvider,
            methodSuffix: ''
        },
        {
            ProviderClass: SushiSwapPolygonProvider,
            methodSuffix: '1'
        },
        {
            ProviderClass: UniSwapV3PolygonProvider,
            methodSuffix: 'V3'
        },
        {
            ProviderClass: AlgebraProvider,
            methodSuffix: 'ALGB'
        },
        {
            ProviderClass: OneinchPolygonProvider,
            methodSuffix: 'Inch'
        }
    ],
    [BLOCKCHAIN_NAME.AVALANCHE]: [
        {
            ProviderClass: PangolinProvider,
            methodSuffix: 'AVAX'
        },
        {
            ProviderClass: JoeProvider,
            methodSuffix: 'AVAX1'
        },
        {
            ProviderClass: SushiSwapAvalancheProvider,
            methodSuffix: ''
        },
        {
            ProviderClass: OneinchAvalancheProvider,
            methodSuffix: 'Inch'
        }
    ],
    [BLOCKCHAIN_NAME.MOONRIVER]: [
        {
            ProviderClass: SolarbeamProvider,
            methodSuffix: ''
        },
        {
            ProviderClass: SushiSwapMoonriverProvider,
            methodSuffix: '1'
        }
    ],
    [BLOCKCHAIN_NAME.FANTOM]: [
        {
            ProviderClass: SpookySwapProvider,
            methodSuffix: ''
        },
        {
            ProviderClass: SpiritSwapProvider,
            methodSuffix: '1'
        },
        {
            ProviderClass: SushiSwapFantomProvider,
            methodSuffix: '2'
        },
        {
            ProviderClass: OneinchFantomProvider,
            methodSuffix: 'Inch'
        }
    ],
    [BLOCKCHAIN_NAME.HARMONY]: [
        {
            ProviderClass: SushiSwapHarmonyProvider,
            methodSuffix: ''
        },
        {
            ProviderClass: ViperSwapHarmonyProvider,
            methodSuffix: '1'
        }
    ],
    [BLOCKCHAIN_NAME.ARBITRUM]: [
        {
            ProviderClass: SushiSwapArbitrumProvider,
            methodSuffix: ''
        },
        {
            ProviderClass: UniSwapV3ArbitrumProvider,
            methodSuffix: 'V3'
        },
        {
            ProviderClass: OneinchArbitrumProvider,
            methodSuffix: 'Inch'
        }
    ],
    [BLOCKCHAIN_NAME.AURORA]: [
        {
            ProviderClass: TrisolarisAuroraProvider,
            methodSuffix: ''
        },
        {
            ProviderClass: WannaSwapAuroraProvider,
            methodSuffix: '1'
        }
    ],
    [BLOCKCHAIN_NAME.TELOS]: [
        {
            ProviderClass: SushiSwapTelosProvider,
            methodSuffix: ''
        },
        {
            ProviderClass: ZappyProvider,
            methodSuffix: '1'
        }
    ]
} as const;
