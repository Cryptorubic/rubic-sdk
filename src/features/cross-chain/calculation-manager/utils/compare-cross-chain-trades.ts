import { WrappedTradeOrNull } from 'src/features/cross-chain/calculation-manager/providers/common/models/wrapped-trade-or-null';
import { MaxAmountError, MinAmountError, RubicSdkError } from 'src/common/errors';
import BigNumber from 'bignumber.js';
import { CelerCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-cross-chain-trade';
import { DebridgeCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/debridge-cross-chain-trade';
import { SymbiosisCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/symbiosis-cross-chain-trade';
import { LifiCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/lifi-cross-chain-trade';
import { ViaCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/via-provider/via-cross-chain-trade';
import { RangoCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/rango-cross-chain-trade';

/**
 * Compares two cross chain trades for sorting algorithm.
 */
export function compareCrossChainTrades(
    nextWrappedTrade: WrappedTradeOrNull,
    prevWrappedTrade: WrappedTradeOrNull
): -1 | 1 {
    if (
        prevWrappedTrade?.error instanceof MinAmountError &&
        nextWrappedTrade?.error instanceof MinAmountError
    ) {
        return prevWrappedTrade.error.minAmount.lte(nextWrappedTrade.error.minAmount) ? 1 : -1;
    }
    if (
        prevWrappedTrade?.error instanceof MaxAmountError &&
        nextWrappedTrade?.error instanceof MaxAmountError
    ) {
        return prevWrappedTrade.error.maxAmount.gte(nextWrappedTrade.error.maxAmount) ? 1 : -1;
    }

    if (!nextWrappedTrade || nextWrappedTrade.error) {
        return 1;
    }
    if (!prevWrappedTrade || prevWrappedTrade.error) {
        return -1;
    }

    const prevTrade = prevWrappedTrade.trade;
    let fromUsd: BigNumber;
    if (prevTrade instanceof CelerCrossChainTrade) {
        fromUsd = prevTrade.fromTrade.toToken.tokenAmount;
    } else if (
        prevTrade instanceof DebridgeCrossChainTrade ||
        prevTrade instanceof SymbiosisCrossChainTrade
    ) {
        fromUsd = prevTrade.transitAmount;
    } else if (
        prevTrade instanceof LifiCrossChainTrade ||
        prevTrade instanceof ViaCrossChainTrade ||
        prevTrade instanceof RangoCrossChainTrade
    ) {
        fromUsd = prevTrade.from.price.multipliedBy(prevTrade.from.tokenAmount);
    } else {
        throw new RubicSdkError('Not supported trade');
    }

    const prevTradeRatio = prevWrappedTrade?.trade?.getTradeAmountRatio(fromUsd);
    const nextTradeRatio = nextWrappedTrade?.trade?.getTradeAmountRatio(fromUsd);

    if (!nextTradeRatio) {
        return 1;
    }
    if (!prevTradeRatio) {
        return -1;
    }
    return prevTradeRatio.lte(nextTradeRatio) ? 1 : -1;
}
