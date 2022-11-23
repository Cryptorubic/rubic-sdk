import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { OnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/on-chain-provider';

/**
 * Record of on-chain trades types and their corresponding instant trade providers.
 */
export type OnChainTypedTradeProviders = Readonly<
    Record<BlockchainName, Partial<Record<OnChainTradeType, OnChainProvider>>>
>;
