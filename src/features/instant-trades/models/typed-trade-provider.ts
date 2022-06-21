import { InstantTradeProvider } from '@features/instant-trades/instant-trade-provider';
import { TradeType } from '@features/instant-trades/models/trade-type';

/**
 * Record of instant trade types and their corresponding instant trade providers.
 */
export type TypedTradeProviders = Readonly<Record<TradeType, InstantTradeProvider>>;
