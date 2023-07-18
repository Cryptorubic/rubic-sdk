import { UniSwapV3ArbitrumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/arbitrum/uni-swap-v3-arbitrum/uni-swap-v3-arbitrum-provider';
import { UniSwapV3EthereumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/uni-swap-v3-ethereum/uni-swap-v3-ethereum-provider';
import { UniSwapV3EthereumPowProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum-pow/uni-swap-v3-ethereum-pow/uni-swap-v3-ethereum-pow-provider';
import { UniSwapV3PolygonProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/uni-swap-v3-polygon/uni-swap-v3-polygon-provider';
import { UniSwapV3PulsechainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/uni-swap-v3-pulsechain/uni-swap-v3-ethereum-provider';
import { UniSwapV3ScrollTestnetProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/scroll-testnet/uni-swap-v3-scroll-testnet/uni-swap-v3-scroll-testnet-provider';

export const UniswapV3TradeProviders = [
    UniSwapV3EthereumProvider,
    UniSwapV3PolygonProvider,
    UniSwapV3ArbitrumProvider,
    UniSwapV3EthereumPowProvider,
    UniSwapV3PulsechainProvider,
    UniSwapV3ScrollTestnetProvider
] as const;
