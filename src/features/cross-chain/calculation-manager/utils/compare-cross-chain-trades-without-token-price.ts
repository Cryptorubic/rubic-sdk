import { MaxAmountError, MinAmountError } from 'src/common/errors';
import { WrappedCrossChainTradeOrNull } from 'src/features/cross-chain/calculation-manager/models/wrapped-cross-chain-trade-or-null';

/**
 * Compares two cross chain trades for sorting algorithm.
 */
export function compareCrossChainTradesWithoutTokenPrice(
    nextWrappedTrade: WrappedCrossChainTradeOrNull,
    prevWrappedTrade: WrappedCrossChainTradeOrNull
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

    if (!prevWrappedTrade || !prevWrappedTrade?.trade || prevWrappedTrade.error) {
        if (
            nextWrappedTrade?.trade ||
            nextWrappedTrade?.error instanceof MinAmountError ||
            nextWrappedTrade?.error instanceof MaxAmountError
        ) {
            return -1;
        }
        return 1;
    }
    if (
        !nextWrappedTrade ||
        nextWrappedTrade.error ||
        nextWrappedTrade?.trade?.to?.tokenAmount.lte(0)
    ) {
        return 1;
    }

    const prevTradeToTokenAmount = prevWrappedTrade?.trade.to.tokenAmount;
    const nextTradeToTokenAmount = nextWrappedTrade?.trade?.to.tokenAmount;

    if (!nextTradeToTokenAmount) {
        return 1;
    }
    if (!prevTradeToTokenAmount) {
        return -1;
    }
    return prevTradeToTokenAmount.lte(nextTradeToTokenAmount) ? -1 : 1;
}
