import BigNumber from 'bignumber.js';
import { Exact } from 'src/features/instant-trades/providers/models/exact';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';

export function getFromToTokensAmountsByExact<T extends BlockchainName>(
    fromToken: PriceToken<T>,
    toToken: PriceToken<T>,
    exact: Exact,
    initialWeiAmount: BigNumber,
    routeWeiAmount: BigNumber
): {
    from: PriceTokenAmount<T>;
    to: PriceTokenAmount<T>;
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
