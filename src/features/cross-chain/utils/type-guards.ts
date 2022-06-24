import { CrossChainTrade } from '@rsdk-features/cross-chain/providers/common/cross-chain-trade';
import { CelerCrossChainTrade } from '@rsdk-features/cross-chain/providers/celer-trade-provider/celer-cross-chain-trade';
import { RubicCrossChainTrade } from '@rsdk-features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-trade';
import { SymbiosisCrossChainTrade } from '@rsdk-features/cross-chain/providers/symbiosis-trade-provider/symbiosis-cross-chain-trade';

export function isCelerCrossChainTrade(trade: CrossChainTrade): trade is CelerCrossChainTrade {
    return trade instanceof CelerCrossChainTrade;
}

export function isRubicCrossChainTrade(trade: CrossChainTrade): trade is RubicCrossChainTrade {
    return trade instanceof RubicCrossChainTrade;
}

export function isSymbiosisCrossChainTrade(
    trade: CrossChainTrade
): trade is SymbiosisCrossChainTrade {
    return trade instanceof SymbiosisCrossChainTrade;
}
