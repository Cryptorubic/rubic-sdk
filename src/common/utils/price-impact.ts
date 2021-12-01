import BigNumber from 'bignumber.js';

export class PriceImpact {
    public static calculatePriceImpact(
        fromTokenPrice: BigNumber,
        fromAmount: BigNumber,
        toTokenPrice: BigNumber,
        toAmount: BigNumber
    ): number | null {
        if (!fromTokenPrice || !toTokenPrice || !fromAmount?.isFinite() || !toAmount?.isFinite()) {
            return null;
        }

        const fromTokenCost = fromAmount.multipliedBy(fromTokenPrice);
        const toTokenCost = toAmount.multipliedBy(toTokenPrice);
        return fromTokenCost
            .minus(toTokenCost)
            .dividedBy(fromTokenCost)
            .multipliedBy(100)
            .dp(2, BigNumber.ROUND_HALF_UP)
            .toNumber();
    }
}
