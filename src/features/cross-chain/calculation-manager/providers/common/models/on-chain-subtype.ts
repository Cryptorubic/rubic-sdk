import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

export interface OnChainSubtype {
    from: OnChainTradeType | undefined;
    to: OnChainTradeType | undefined;
}
