import { TokenBaseStruct } from '@core/blockchain/models/token-base-struct';
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
    to:
        | Token
        | string
        | {
              address: string;
              blockchain: BLOCKCHAIN_NAME;
          }
): Promise<{
    from: PriceTokenAmount;
    to: PriceToken;
}> {
    const fromPriceTokenPromise =
        from instanceof Token ? PriceToken.createFromToken(from) : PriceToken.createToken(from);

    let toPriceTokenPromise;
    switch (true) {
        case to instanceof Token:
            toPriceTokenPromise = PriceToken.createFromToken(to as Token);
            break;
        case typeof to === 'object':
            toPriceTokenPromise = PriceToken.createToken(to as TokenBaseStruct);
            break;
        default:
            toPriceTokenPromise = PriceToken.createToken({
                address: to as string,
                blockchain: from.blockchain
            });
    }

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
