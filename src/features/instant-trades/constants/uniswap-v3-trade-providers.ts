import { UniSwapV3EthereumProvider } from 'src/features/instant-trades/dexes/ethereum/uni-swap-v3-ethereum/uni-swap-v3-ethereum-provider';
import { UniSwapV3PolygonProvider } from 'src/features/instant-trades/dexes/polygon/uni-swap-v3-polygon/uni-swap-v3-polygon-provider';
import { UniSwapV3ArbitrumProvider } from 'src/features/instant-trades/dexes/arbitrum/uni-swap-v3-arbitrum/uni-swap-v3-arbitrum-provider';

export const UniswapV3TradeProviders = [
    UniSwapV3EthereumProvider,
    UniSwapV3PolygonProvider,
    UniSwapV3ArbitrumProvider
] as const;
