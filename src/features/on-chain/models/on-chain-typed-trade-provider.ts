import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { OnChainTradeType } from 'src/features/on-chain/providers/models/on-chain-trade-type';
import { OnChainProvider } from 'src/features/on-chain/providers/dexes/abstract/on-chain-provider/on-chain-provider';

/**
 * Record of on-chain trades types and their corresponding instant trade providers.
 */
export type OnChainTypedTradeProviders = Readonly<
    Record<BlockchainName, Partial<Record<OnChainTradeType, OnChainProvider>>>
>;
