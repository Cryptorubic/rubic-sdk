import { InstantTradeProvider } from '@rsdk-features/instant-trades/instant-trade-provider';
import { TradeType } from '@rsdk-features/instant-trades/models/trade-type';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';

/**
 * Record of instant trade types and their corresponding instant trade providers.
 */
export type TypedTradeProviders = Readonly<
    Record<BlockchainName, Partial<Record<TradeType, InstantTradeProvider>>>
>;
