import { RubicSdkError } from 'src/common/errors';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

export interface OnChainTradeError {
    type: OnChainTradeType;
    error: RubicSdkError;
}
