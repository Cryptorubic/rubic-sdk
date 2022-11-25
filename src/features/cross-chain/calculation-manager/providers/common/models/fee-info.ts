import BigNumber from 'bignumber.js';

/**
 * Transaction fee information.
 */
export interface FeeInfo {
    /**
     * Fees, taken by cross-chain proxy or celer contract .
     * Attached as additional amounts.
     */
    rubicProxy?: {
        /**
         * Fixed crypto fee attached as additional value.
         */
        fixedFee?: {
            amount: BigNumber;
            tokenSymbol: string;
        };

        /**
         * Platform fee which is percent from token in amount.
         */
        platformFee?: {
            percent: number;
            tokenSymbol: string;
        };
    };

    /**
     * Fees, taken by provider.
     * Already included in amounts.
     */
    provider?: {
        /**
         * Crypto fee to pay swap in target network.
         */
        cryptoFee?: {
            amount: BigNumber;
            tokenSymbol: string;
        };

        /**
         * Platform fee which is percent from token in amount.
         */
        platformFee?: {
            percent: number;
            tokenSymbol: string;
        };
    };
}
