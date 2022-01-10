import { TokenBaseStruct } from '../../core/blockchain/models/token-base-struct';
import { PriceToken, PriceTokenStruct } from '../../core/blockchain/tokens/price-token';
import { PriceTokenAmount, PriceTokenAmountBaseStruct, PriceTokenAmountStruct } from '../../core/blockchain/tokens/price-token-amount';
import { Token, TokenStruct } from '../../core/blockchain/tokens/token';
import { BLOCKCHAIN_NAME } from '../../core/blockchain/models/BLOCKCHAIN_NAME';
import BigNumber from 'bignumber.js';
export declare class TokensManager {
    createTokenFromStruct(tokenStruct: TokenStruct): Token;
    createToken(tokenBaseStruct: TokenBaseStruct): Promise<Token>;
    createTokensFromStructs(tokensStructs: TokenStruct[]): Token[];
    createTokens(addresses: string[], blockchain: BLOCKCHAIN_NAME): Promise<Token[]>;
    createPriceTokenFromStruct(priceTokenStruct: PriceTokenStruct): PriceToken;
    createPriceToken(token: TokenBaseStruct | TokenStruct): Promise<PriceToken>;
    createPriceTokenAmountFromStruct(priceTokenAmountStruct: PriceTokenAmountStruct): PriceTokenAmount;
    createPriceTokenAmount(priceTokenAmountStruct: PriceTokenAmountBaseStruct | (TokenStruct & ({
        weiAmount: BigNumber;
    } | {
        tokenAmount: BigNumber;
    }))): Promise<PriceTokenAmount>;
}
