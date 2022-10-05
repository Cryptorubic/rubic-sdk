import { OnChainTradeType } from 'src/features/on-chain/providers/models/on-chain-trade-type';

export interface ItType {
    from: OnChainTradeType | undefined;
    to: OnChainTradeType | undefined;
}
