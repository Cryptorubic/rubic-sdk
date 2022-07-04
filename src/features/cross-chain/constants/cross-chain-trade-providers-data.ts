import { UniSwapV2EthereumProvider } from '@rsdk-features/instant-trades/dexes/ethereum/uni-swap-v2-ethereum/uni-swap-v2-ethereum-provider';
import { SushiSwapEthereumProvider } from '@rsdk-features/instant-trades/dexes/ethereum/sushi-swap-ethereum/sushi-swap-ethereum-provider';
import { UniSwapV3EthereumProvider } from '@rsdk-features/instant-trades/dexes/ethereum/uni-swap-v3-ethereum/uni-swap-v3-ethereum-provider';
import { OneinchEthereumProvider } from '@rsdk-features/instant-trades/dexes/ethereum/oneinch-ethereum/oneinch-ethereum-provider';
import { PancakeSwapProvider } from '@rsdk-features/instant-trades/dexes/bsc/pancake-swap/pancake-swap-provider';
import { QuickSwapProvider } from '@rsdk-features/instant-trades/dexes/polygon/quick-swap/quick-swap-provider';
import { PangolinProvider } from '@rsdk-features/instant-trades/dexes/avalanche/pangolin/pangolin-provider';
import { JoeProvider } from '@rsdk-features/instant-trades/dexes/avalanche/joe/joe-provider';
import { SushiSwapAvalancheProvider } from '@rsdk-features/instant-trades/dexes/avalanche/sushi-swap-avalanche/sushi-swap-avalanche-provider';
import { SolarbeamProvider } from '@rsdk-features/instant-trades/dexes/moonriver/solarbeam/solarbeam-provider';
import { SushiSwapMoonriverProvider } from '@rsdk-features/instant-trades/dexes/moonriver/sushi-swap-moonriver/sushi-swap-moonriver-provider';
import { SpookySwapProvider } from '@rsdk-features/instant-trades/dexes/fantom/spooky-swap/spooky-swap-provider';
import { SpiritSwapProvider } from '@rsdk-features/instant-trades/dexes/fantom/spirit-swap/spirit-swap-provider';
import { SushiSwapFantomProvider } from '@rsdk-features/instant-trades/dexes/fantom/sushi-swap-fantom/sushi-swap-fantom-provider';
import { SushiSwapHarmonyProvider } from '@rsdk-features/instant-trades/dexes/harmony/sushi-swap-harmony/sushi-swap-harmony-provider';
import { ViperSwapHarmonyProvider } from '@rsdk-features/instant-trades/dexes/harmony/viper-swap-harmony/viper-swap-harmony-provider';
import { SushiSwapArbitrumProvider } from '@rsdk-features/instant-trades/dexes/arbitrum/sushi-swap-arbitrum/sushi-swap-arbitrum-provider';
import { UniSwapV3ArbitrumProvider } from '@rsdk-features/instant-trades/dexes/arbitrum/uni-swap-v3-arbitrum/uni-swap-v3-arbitrum-provider';
import { OneinchArbitrumProvider } from '@rsdk-features/instant-trades/dexes/arbitrum/oneinch-arbitrum/oneinch-arbitrum-provider';
import { TrisolarisAuroraProvider } from '@rsdk-features/instant-trades/dexes/aurora/trisolaris-aurora/trisolaris-aurora-provider';
import { WannaSwapAuroraProvider } from '@rsdk-features/instant-trades/dexes/aurora/wanna-swap-aurora/wanna-swap-aurora-provider';
import { DeepReadonly } from 'ts-essentials';
import { InstantTradeProvider } from 'src/features';
import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';
import { SushiSwapTelosProvider } from '@rsdk-features/instant-trades/dexes/telos/sushi-swap-telos/sushi-swap-telos-provider';
import { ZappyProvider } from '@rsdk-features/instant-trades/dexes/telos/zappy/trisolaris-aurora-provider';
import { OneinchFantomProvider } from 'src/features/instant-trades/dexes/fantom/oneinch-fantom/oneinch-fantom-provider';
import { OneinchAvalancheProvider } from 'src/features/instant-trades/dexes/avalanche/oneinch-avalanche/oneinch-avalanche-provider';

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
        }
        // {
        //     ProviderClass: SushiSwapBscProvider,
        //     methodSuffix: '1'
        // },
        // {
        //     ProviderClass: OneinchBscProvider,
        //     methodSuffix: 'Inch'
        // }
    ],
    [BLOCKCHAIN_NAME.POLYGON]: [
        {
            ProviderClass: QuickSwapProvider,
            methodSuffix: ''
        }
        // {
        //     ProviderClass: SushiSwapPolygonProvider,
        //     methodSuffix: '1'
        // },
        // {
        //     ProviderClass: UniSwapV3PolygonProvider,
        //     methodSuffix: 'V3'
        // },
        // {
        //     ProviderClass: AlgebraProvider,
        //     methodSuffix: 'ALGB'
        // },
        // {
        //     ProviderClass: OneinchPolygonProvider,
        //     methodSuffix: 'Inch'
        // }
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
