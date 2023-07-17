import { OneinchArbitrumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/arbitrum/oneinch-arbitrum/oneinch-arbitrum-provider';
import { OneinchAuroraProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/aurora/oneinch-arbitrum/oneinch-aurora-provider';
import { OneinchAvalancheProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/oneinch-avalanche/oneinch-avalanche-provider';
import { OneinchBscProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/oneinch-bsc/oneinch-bsc-provider';
import { OneinchEthereumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/oneinch-ethereum/oneinch-ethereum-provider';
import { OneinchFantomProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/fantom/oneinch-fantom/oneinch-fantom-provider';
import { OneinchOptimismProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/optimism/oneinch-optimism/oneinch-optimism-provider';
import { OneinchPolygonProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/oneinch-polygon/oneinch-polygon-provider';
import { OneinchZksyncProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/oneinch-zksync/oneinch-zksync-provider';

export const OneinchTradeProviders = [
    OneinchEthereumProvider,
    OneinchBscProvider,
    OneinchPolygonProvider,
    OneinchAvalancheProvider,
    OneinchFantomProvider,
    OneinchArbitrumProvider,
    OneinchOptimismProvider,
    OneinchZksyncProvider,
    OneinchAuroraProvider
] as const;
