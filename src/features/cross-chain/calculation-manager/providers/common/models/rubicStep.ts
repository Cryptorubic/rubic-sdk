import { Token, TokenAmount } from 'src/common/tokens';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-type';

import { BridgeType } from './bridge-type';

export interface CrossChainStep {
    provider: BridgeType;
    type: 'cross-chain';
    path: (TokenAmount | Token)[];
}

interface OnChainStep {
    path: Token[];
    provider: OnChainTradeType;
    type: 'on-chain';
}

export type RubicStep = CrossChainStep | OnChainStep;
