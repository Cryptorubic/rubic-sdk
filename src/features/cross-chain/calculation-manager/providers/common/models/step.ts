import { Token } from 'src/common/tokens';
import { CrossChainTradeType } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

interface CrossChainStep {
    provider: CrossChainTradeType;
    type: 'cross-chain';
    path: Token[];
}

interface OnChainStep {
    path: Token[];
    provider: OnChainTradeType;
    type: 'on-chain';
}

export type Step = CrossChainStep | OnChainStep;
