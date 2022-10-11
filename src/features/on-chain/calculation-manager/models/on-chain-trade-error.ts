import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/models/on-chain-trade-type';
import { RubicSdkError } from 'src/common/errors';

export interface OnChainTradeError {
    type: OnChainTradeType;
    error: RubicSdkError;
}
