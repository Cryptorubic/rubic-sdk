import { UniSwapV3EthereumProvider } from 'src/features/instant-trades/providers/dexes/ethereum/uni-swap-v3-ethereum/uni-swap-v3-ethereum-provider';
import { UniSwapV3PolygonProvider } from 'src/features/instant-trades/providers/dexes/polygon/uni-swap-v3-polygon/uni-swap-v3-polygon-provider';
import { UniSwapV3ArbitrumProvider } from 'src/features/instant-trades/providers/dexes/arbitrum/uni-swap-v3-arbitrum/uni-swap-v3-arbitrum-provider';
import { UniSwapV3EthereumPowProvider } from 'src/features/instant-trades/providers/dexes/ethereum-pow/uni-swap-v3-ethereum-pow/uni-swap-v3-ethereum-pow-provider';

export const UniswapV3TradeProviders = [
    UniSwapV3EthereumProvider,
    UniSwapV3PolygonProvider,
    UniSwapV3ArbitrumProvider,
    UniSwapV3EthereumPowProvider
] as const;
