import { RubicSdkError } from 'src/common/errors';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

import { OnChainTrade } from '../providers/common/on-chain-trade/on-chain-trade';

export interface OnChainTradeError {
    type: OnChainTradeType;
    error: RubicSdkError;
    trade?: OnChainTrade;
}
