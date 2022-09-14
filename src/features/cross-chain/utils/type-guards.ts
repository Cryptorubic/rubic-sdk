import { CrossChainTrade } from 'src/features/cross-chain/providers/common/cross-chain-trade';
import { CelerCrossChainTrade } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-trade';
import { SymbiosisCrossChainTrade } from 'src/features/cross-chain/providers/symbiosis-trade-provider/symbiosis-cross-chain-trade';
import { LifiCrossChainTrade } from 'src/features/cross-chain/providers/lifi-trade-provider/lifi-cross-chain-trade';

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
