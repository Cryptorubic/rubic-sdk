import { CelerCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-cross-chain-trade';
import { CrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { LifiCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/lifi-cross-chain-trade';
import { SymbiosisCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/symbiosis-cross-chain-trade';

export function isCelerCrossChainTrade(trade: CrossChainTrade): trade is CelerCrossChainTrade {
    return trade instanceof CelerCrossChainTrade;
}

export function isSymbiosisCrossChainTrade(
    trade: CrossChainTrade
): trade is SymbiosisCrossChainTrade {
    return trade instanceof SymbiosisCrossChainTrade;
}

export function isLifiCrossChainTrade(trade: CrossChainTrade): trade is LifiCrossChainTrade {
    return trade instanceof LifiCrossChainTrade;
}
