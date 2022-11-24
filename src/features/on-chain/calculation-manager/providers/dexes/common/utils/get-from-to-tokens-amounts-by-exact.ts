import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';

export function getFromToTokensAmountsByExact<T extends BlockchainName>(
    fromToken: PriceToken<T>,
    toToken: PriceToken<T>,
    exact: Exact,
    initialWeiAmount: BigNumber,
    weiAmountWithoutFee: BigNumber,
    routeWeiAmount: BigNumber
): {
    from: PriceTokenAmount<T>;
    to: PriceTokenAmount<T>;
    fromWithoutFee: PriceTokenAmount<T>;
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
    const fromWithoutFee = new PriceTokenAmount({
        ...fromToken.asStruct,
        weiAmount: weiAmountWithoutFee
    });

    return { from, to, fromWithoutFee };
}
