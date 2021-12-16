import { Token } from '../../../../../../../../core/blockchain/tokens/token';
export declare type FeeAmount = 500 | 3000 | 10000;
/**
 * Represents liquidity pool in uni v3.
 */
export declare class LiquidityPool {
    readonly address: string;
    readonly token0: Token;
    readonly token1: Token;
    readonly fee: FeeAmount;
    constructor(address: string, token0: Token, token1: Token, fee: FeeAmount);
    /**
     * Checks if the pool contains passed tokens.
     * @param tokenA First token address.
     * @param tokenB Second token address.
     */
    isPoolWithTokens(tokenA: string, tokenB: string): boolean;
}
