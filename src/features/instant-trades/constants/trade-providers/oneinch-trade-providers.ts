import { OneinchEthereumProvider } from 'src/features/instant-trades/providers/dexes/ethereum/oneinch-ethereum/oneinch-ethereum-provider';
import { OneinchBscProvider } from 'src/features/instant-trades/providers/dexes/bsc/oneinch-bsc/oneinch-bsc-provider';
import { OneinchPolygonProvider } from 'src/features/instant-trades/providers/dexes/polygon/oneinch-polygon/oneinch-polygon-provider';
import { OneinchAvalancheProvider } from 'src/features/instant-trades/providers/dexes/avalanche/oneinch-avalanche/oneinch-avalanche-provider';
import { OneinchFantomProvider } from 'src/features/instant-trades/providers/dexes/fantom/oneinch-fantom/oneinch-fantom-provider';
import { OneinchArbitrumProvider } from 'src/features/instant-trades/providers/dexes/arbitrum/oneinch-arbitrum/oneinch-arbitrum-provider';

export const OneinchTradeProviders = [
    OneinchEthereumProvider,
    OneinchBscProvider,
    OneinchPolygonProvider,
    OneinchAvalancheProvider,
    OneinchFantomProvider,
    OneinchArbitrumProvider
] as const;
