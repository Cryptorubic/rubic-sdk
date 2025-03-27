import { Token } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';

export type FeeAmount = 8 | 40 | 100 | 200 | 300 | 500 | 1000 | 3000 | 10000;

/**
 * Represents liquidity pool in uni v3.
 */
export class LiquidityPool {
    constructor(
        public readonly address: string,
        public readonly token0: Token,
        public readonly token1: Token,
        public readonly fee: FeeAmount
    ) {}

    /**
     * Checks if the pool contains passed tokens.
     * @param tokenA First token address.
     * @param tokenB Second token address.
     */
    public isPoolWithTokens(tokenA: string, tokenB: string): boolean {
        return (
            (compareAddresses(this.token0.address, tokenA) &&
                compareAddresses(this.token1.address, tokenB)) ||
            (compareAddresses(this.token1.address, tokenA) &&
                compareAddresses(this.token0.address, tokenB))
        );
    }
}
