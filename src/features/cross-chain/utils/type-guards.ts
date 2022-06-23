import { CrossChainTrade } from '@features/cross-chain/providers/common/cross-chain-trade';
import { CelerCrossChainTrade } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-trade';
import { RubicCrossChainTrade } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-trade';
import { SymbiosisCrossChainTrade } from '@features/cross-chain/providers/symbiosis-trade-provider/symbiosis-cross-chain-trade';

export function isCelerCrossChainTrade(trade: CrossChainTrade) {
    return trade instanceof CelerCrossChainTrade;
}

export function isRubicCrossChainTrade(trade: CrossChainTrade) {
    return trade instanceof RubicCrossChainTrade;
}

export function isSymbiosisCrossChainTrade(trade: CrossChainTrade) {
    return trade instanceof SymbiosisCrossChainTrade;
}
