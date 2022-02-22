import { PriceToken } from 'src/core';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import BigNumber from 'bignumber.js';
import { Exact } from '@features/swap/models/exact';

export function getFromToTokensAmountsByExact(
    fromToken: PriceToken,
    toToken: PriceToken,
    exact: Exact,
    initialWeiAmount: BigNumber,
    routeWeiAmount: BigNumber
): {
    from: PriceTokenAmount;
    to: PriceTokenAmount;
} {
    const fromAmount = exact === 'input' ? initialWeiAmount : routeWeiAmount;
    const toAmount = exact === 'output' ? initialWeiAmount : routeWeiAmount;
    const from = new PriceTokenAmount({
        ...fromToken.asStruct,
        weiAmount: fromAmount
    });
    const to = new PriceTokenAmount({
        ...toToken.asStruct,
        weiAmount: toAmount
    });

    return { from, to };
}
