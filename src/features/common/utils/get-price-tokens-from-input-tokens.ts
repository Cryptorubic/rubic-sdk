import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { TokenBaseStruct } from 'src/common/tokens/models/token-base-struct';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';

export async function getPriceTokensFromInputTokens<T extends BlockchainName = BlockchainName>(
    from:
        | Token<T>
        | {
              address: string;
              blockchain: T;
          }
        | PriceToken<T>,
    fromAmount: string | number | BigNumber,
    to:
        | Token<T>
        | string
        | {
              address: string;
              blockchain: T;
          }
        | PriceToken<T>
): Promise<{
    from: PriceTokenAmount<T>;
    to: PriceToken<T>;
}> {
    let fromPriceTokenPromise: Promise<PriceToken<T>>;

    if (from instanceof PriceToken) {
        fromPriceTokenPromise = new Promise(resolve => resolve(from));
    } else if (from instanceof Token) {
        fromPriceTokenPromise = PriceToken.createFromToken(from);
    } else {
        fromPriceTokenPromise = PriceToken.createToken(from);
    }

    let toPriceTokenPromise: Promise<PriceToken<T>>;

    if (to instanceof PriceToken) {
        toPriceTokenPromise = new Promise(resolve => resolve(to));
    } else if (to instanceof Token) {
        toPriceTokenPromise = PriceToken.createFromToken(to as Token<T>);
    } else if (typeof to === 'object') {
        toPriceTokenPromise = PriceToken.createToken(to as TokenBaseStruct<T>);
    } else {
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
