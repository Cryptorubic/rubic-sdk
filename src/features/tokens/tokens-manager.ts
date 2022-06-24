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

/**
 * Contains methods to create Tokens classes.
 */
export class TokensManager {
    /**
     * Creates {@link Token} instance by full token data struct.
     * @param tokenStruct Full token's structure.
     */
    public createTokenFromStruct(tokenStruct: TokenStruct): Token {
        return new Token(tokenStruct);
    }

    /**
     * Fetches token data and creates {@link Token} by token's address and blockchain.
     *
     * @example
     * ```ts
     * const token = await sdk.tokens.createToken({
     *     blockchain: BLOCKCHAIN_NAME.ETHEREUM,
     *     address:  '0xdac17f958d2ee523a2206206994597c13d831ec7'
     * });
     *
     * console.log(token.symbol); // USDT
     * console.log(token.name); // Tether USD
     * console.log(token.decimals); // 6
     * ```
     *
     * @param tokenBaseStruct Base token's structure.
     */
    public createToken(tokenBaseStruct: TokenBaseStruct): Promise<Token> {
        return Token.createToken(tokenBaseStruct);
    }

    /**
     * Same as {@link createTokenFromStruct} for multiple tokens structs.
     * @param tokensStructs Full tokens' structures.
     */
    public createTokensFromStructs(tokensStructs: TokenStruct[]): Token[] {
        return tokensStructs.map(tokenStruct => this.createTokenFromStruct(tokenStruct));
    }

    /**
     * Same as {@link createTokensFromStructs}, but uses multicall for data fetching,
     * so makes only one rpc request.
     * @param addresses Tokens' addresses.
     * @param blockchain Tokens' blockchain.
     */
    public createTokens(addresses: string[], blockchain: BlockchainName): Promise<Token[]> {
        return Token.createTokens(addresses, blockchain);
    }

    /**
     * Creates {@link PriceToken} from full price token struct including price.
     * @param priceTokenStruct Full price token structure.
     */
    public createPriceTokenFromStruct(priceTokenStruct: PriceTokenStruct): PriceToken {
        return new PriceToken(priceTokenStruct);
    }

    /**
     * Creates {@link PriceToken} from full token structure (without price) or from token address and blockchain.
     *
     * @example
     * ```ts
     * const token = await sdk.tokens.createPriceToken({
     *     blockchain: BLOCKCHAIN_NAME.ETHEREUM,
     *     address:  '0xdac17f958d2ee523a2206206994597c13d831ec7'
     * });
     *
     * console.log(token.price.toFormat(2)); // 1.00
     * ```
     *
     * @param token Full or base token's structure.
     */
    public createPriceToken(token: TokenBaseStruct | TokenStruct): Promise<PriceToken> {
        if ('name' in token && 'symbol' in token && 'decimals' in token) {
            return PriceToken.createFromToken(token);
        }
        return PriceToken.createToken(token);
    }

    /**
     * Creates {@link PriceTokenAmount} from full price token struct including price.
     * @param priceTokenAmountStruct Full price token amount structure.
     */
    public createPriceTokenAmountFromStruct(
        priceTokenAmountStruct: PriceTokenAmountStruct
    ): PriceTokenAmount {
        return new PriceTokenAmount(priceTokenAmountStruct);
    }

    /**
     * Creates {@link PriceTokenAmount} from full token structure (without price) or
     * from token address and blockchain.
     *
     * @example
     * ```ts
     * const token = await sdk.tokens.createPriceTokenAmount({
     *     blockchain: BLOCKCHAIN_NAME.ETHEREUM,
     *     address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
     *     tokenAmount: new BigNumber(1)
     * });
     *
     * console.log(token.tokenAmount.toNumber()); // 1
     * console.log(token.stringWeiAmount); // 1000000
     * ```
     *
     * @param priceTokenAmountStruct Full or base token's structure with amount.
     */
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
