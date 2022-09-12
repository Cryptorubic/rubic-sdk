import { TokenBaseStruct } from 'src/common/tokens/models/token-base-struct';
import BigNumber from 'bignumber.js';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';

export async function getPriceTokensFromInputTokens<T extends BlockchainName = BlockchainName>(
    from:
        | Token<T>
        | {
              address: string;
              blockchain: T;
          },
    fromAmount: string,
    to:
        | Token<T>
        | string
        | {
              address: string;
              blockchain: T;
          }
): Promise<{
    from: PriceTokenAmount<T>;
    to: PriceToken<T>;
}> {
    const fromPriceTokenPromise =
        from instanceof Token ? PriceToken.createFromToken(from) : PriceToken.createToken(from);

    let toPriceTokenPromise;
    switch (true) {
        case to instanceof Token:
            toPriceTokenPromise = PriceToken.createFromToken(to as Token<T>);
            break;
        case typeof to === 'object':
            toPriceTokenPromise = PriceToken.createToken(to as TokenBaseStruct<T>);
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
