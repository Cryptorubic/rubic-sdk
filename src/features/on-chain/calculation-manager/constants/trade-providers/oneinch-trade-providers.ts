import { OneinchEthereumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/oneinch-ethereum/oneinch-ethereum-provider';
import { OneinchBscProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/oneinch-bsc/oneinch-bsc-provider';
import { OneinchPolygonProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/oneinch-polygon/oneinch-polygon-provider';
import { OneinchAvalancheProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/oneinch-avalanche/oneinch-avalanche-provider';
import { OneinchFantomProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/fantom/oneinch-fantom/oneinch-fantom-provider';
import { OneinchArbitrumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/arbitrum/oneinch-arbitrum/oneinch-arbitrum-provider';

export const OneinchTradeProviders = [
    OneinchEthereumProvider,
    OneinchBscProvider,
    OneinchPolygonProvider,
    OneinchAvalancheProvider,
    OneinchFantomProvider,
    OneinchArbitrumProvider
] as const;
