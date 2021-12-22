import { Token } from '../../core/blockchain/tokens/token';
import { PriceToken } from '../../core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '../../core/blockchain/tokens/price-token-amount';
import { BLOCKCHAIN_NAME } from '../../core/blockchain/models/BLOCKCHAIN_NAME';
export declare function getPriceTokensFromInputTokens(from: Token | {
    address: string;
    blockchain: BLOCKCHAIN_NAME;
}, fromAmount: string, to: Token | string | {
    address: string;
    blockchain: BLOCKCHAIN_NAME;
}): Promise<{
    from: PriceTokenAmount;
    to: PriceToken;
}>;
