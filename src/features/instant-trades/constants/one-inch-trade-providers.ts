import { OneinchEthereumProvider } from '@features/instant-trades/dexes/ethereum/oneinch-ethereum/oneinch-ethereum-provider';
import { OneinchBscProvider } from '@features/instant-trades/dexes/bsc/oneinch-bsc/oneinch-bsc-provider';
import { OneinchPolygonProvider } from '@features/instant-trades/dexes/polygon/oneinch-polygon/oneinch-polygon-provider';
import { OneinchAvalancheProvider } from '@features/instant-trades/dexes/avalanche/oneinch-avalanche/oneinch-avalanche-provider';

export const OneInchTradeProviders = [
    OneinchEthereumProvider,
    OneinchBscProvider,
    OneinchPolygonProvider,
    OneinchAvalancheProvider
] as const;
