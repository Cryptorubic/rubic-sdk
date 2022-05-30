import { UniSwapV2EthereumProvider } from '@features/instant-trades/dexes/ethereum/uni-swap-v2-ethereum/uni-swap-v2-ethereum-provider';
import { SushiSwapEthereumProvider } from '@features/instant-trades/dexes/ethereum/sushi-swap-ethereum/sushi-swap-ethereum-provider';
import { PancakeSwapProvider } from '@features/instant-trades/dexes/bsc/pancake-swap/pancake-swap-provider';
import { SushiSwapBscProvider } from '@features/instant-trades/dexes/bsc/sushi-swap-bsc/sushi-swap-bsc-provider';
import { QuickSwapProvider } from '@features/instant-trades/dexes/polygon/quick-swap/quick-swap-provider';
import { SushiSwapPolygonProvider } from '@features/instant-trades/dexes/polygon/sushi-swap-polygon/sushi-swap-polygon-provider';
import { JoeProvider } from '@features/instant-trades/dexes/avalanche/joe/joe-provider';
import { PangolinProvider } from '@features/instant-trades/dexes/avalanche/pangolin/pangolin-provider';
import { SushiSwapAvalancheProvider } from '@features/instant-trades/dexes/avalanche/sushi-swap-avalanche/sushi-swap-avalanche-provider';
import { SolarbeamProvider } from '@features/instant-trades/dexes/moonriver/solarbeam/solarbeam-provider';
import { SushiSwapMoonriverProvider } from '@features/instant-trades/dexes/moonriver/sushi-swap-moonriver/sushi-swap-moonriver-provider';
import { SpiritSwapProvider } from '@features/instant-trades/dexes/fantom/spirit-swap/spirit-swap-provider';
import { SpookySwapProvider } from '@features/instant-trades/dexes/fantom/spooky-swap/spooky-swap-provider';
import { SushiSwapFantomProvider } from '@features/instant-trades/dexes/fantom/sushi-swap-fantom/sushi-swap-fantom-provider';
import { SushiSwapHarmonyProvider } from '@features/instant-trades/dexes/harmony/sushi-swap-harmony/sushi-swap-harmony-provider';
import { ViperSwapHarmonyProvider } from '@features/instant-trades/dexes/harmony/viper-swap-harmony/viper-swap-harmony-provider';
import { OneinchArbitrumProvider } from '@features/instant-trades/dexes/arbitrum/oneinch-arbitrum/oneinch-arbitrum-provider';
import { SushiSwapArbitrumProvider } from '@features/instant-trades/dexes/arbitrum/sushi-swap-arbitrum/sushi-swap-arbitrum-provider';
import { UniSwapV3ArbitrumProvider } from '@features/instant-trades/dexes/arbitrum/uni-swap-v3-arbitrum/uni-swap-v3-arbitrum-provider';
import { TrisolarisAuroraProvider } from '@features/instant-trades/dexes/aurora/trisolaris-aurora/trisolaris-aurora-provider';
import { WannaSwapAuroraProvider } from '@features/instant-trades/dexes/aurora/wanna-swap-aurora/wanna-swap-aurora-provider';

export const UniswapV2TradeProviders = [
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
