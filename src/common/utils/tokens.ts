import { TokenBaseStruct } from 'src/common/tokens-manager/models/token-base-struct';
import BigNumber from 'bignumber.js';
import { BlockchainName } from '@rsdk-core/blockchain/models/blockchain-name';
import { PriceToken, PriceTokenAmount, Token } from 'src/common';

export async function getPriceTokensFromInputTokens(
    from:
        | Token
        | {
              address: string;
              blockchain: BlockchainName;
          },
    fromAmount: string,
    to:
        | Token
        | string
        | {
              address: string;
              blockchain: BlockchainName;
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
