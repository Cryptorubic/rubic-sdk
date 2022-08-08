import BigNumber from 'bignumber.js';

/**
 * Transaction fee information.
 */
export interface FeeInfo {
    /**
     * Fixed crypto fee attached as additional value.
     */
    readonly fixedFee: {
        readonly amount: BigNumber;
        readonly tokenSymbol: string;
    };

    /**
     * Platform fee which is percent from token in amount.
     */
    readonly platformFee: {
        readonly percent: number;
        readonly tokenSymbol: string;
    };

    /**
     * Crypto fee to pay swap in target network.
     */
    readonly cryptoFee: {
        readonly amount: BigNumber;
        readonly tokenSymbol: string;
    } | null;
}
