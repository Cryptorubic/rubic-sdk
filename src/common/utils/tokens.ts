import { Token } from '@core/blockchain/tokens/token';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';

export async function getPriceTokensFromInputTokens(
    from:
        | Token
        | {
              address: string;
              blockchain: BLOCKCHAIN_NAME;
          },
    fromAmount: string,
    to: Token | string
): Promise<{
    from: PriceTokenAmount;
    to: PriceToken;
}> {
    const fromPriceTokenPromise =
        from instanceof Token ? PriceToken.createFromToken(from) : PriceToken.createToken(from);

    const toPriceTokenPromise =
        to instanceof Token
            ? PriceToken.createFromToken(to)
            : PriceToken.createToken({ address: to, blockchain: from.blockchain });

    const [fromPriceToken, toPriceToken] = await Promise.all([
        fromPriceTokenPromise,
        toPriceTokenPromise
    ]);

    const fromPriceTokenAmount = new PriceTokenAmount({
        ...fromPriceToken.asStruct,
        tokenAmount: new BigNumber(fromAmount)
    });

    return {
        from: fromPriceTokenAmount,
        to: toPriceToken
    };
}
