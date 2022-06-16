import { TokenBaseStruct } from '@rsdk-core/blockchain/models/token-base-struct';
import { PriceToken, PriceTokenStruct } from '@rsdk-core/blockchain/tokens/price-token';
import {
    PriceTokenAmount,
    PriceTokenAmountBaseStruct,
    PriceTokenAmountStruct
} from '@rsdk-core/blockchain/tokens/price-token-amount';
import { Token, TokenStruct } from '@rsdk-core/blockchain/tokens/token';
import { BlockchainName } from '@rsdk-core/blockchain/models/blockchain-name';
import BigNumber from 'bignumber.js';

export class TokensManager {
    public createTokenFromStruct(tokenStruct: TokenStruct): Token {
        return new Token(tokenStruct);
    }

    public createToken(tokenBaseStruct: TokenBaseStruct): Promise<Token> {
        return Token.createToken(tokenBaseStruct);
    }

    public createTokensFromStructs(tokensStructs: TokenStruct[]): Token[] {
        return tokensStructs.map(tokenStruct => this.createTokenFromStruct(tokenStruct));
    }

    public createTokens(addresses: string[], blockchain: BlockchainName): Promise<Token[]> {
        return Token.createTokens(addresses, blockchain);
    }

    public createPriceTokenFromStruct(priceTokenStruct: PriceTokenStruct): PriceToken {
        return new PriceToken(priceTokenStruct);
    }

    public createPriceToken(token: TokenBaseStruct | TokenStruct): Promise<PriceToken> {
        if ('name' in token && 'symbol' in token && 'decimals' in token) {
            return PriceToken.createFromToken(token);
        }
        return PriceToken.createToken(token);
    }

    public createPriceTokenAmountFromStruct(
        priceTokenAmountStruct: PriceTokenAmountStruct
    ): PriceTokenAmount {
        return new PriceTokenAmount(priceTokenAmountStruct);
    }

    public createPriceTokenAmount(
        priceTokenAmountStruct:
            | PriceTokenAmountBaseStruct
            | (TokenStruct & ({ weiAmount: BigNumber } | { tokenAmount: BigNumber }))
    ): Promise<PriceTokenAmount> {
        if (
            'name' in priceTokenAmountStruct &&
            'symbol' in priceTokenAmountStruct &&
            'decimals' in priceTokenAmountStruct
        ) {
            return PriceTokenAmount.createFromToken(priceTokenAmountStruct);
        }
        return PriceTokenAmount.createToken(priceTokenAmountStruct);
    }
}
