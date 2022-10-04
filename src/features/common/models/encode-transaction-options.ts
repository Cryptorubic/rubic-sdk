/**
 * Stores options for transaction in `encode` function.
 */
export interface EncodeTransactionOptions {
    /**
     * User wallet address to send swap transaction.
     */
    fromAddress: string;

    receiverAddress?: string;

    /**
     * Evm-transaction gas price.
     */
    gasPrice?: string;

    /**
     * Evm-transaction gas limit.
     */
    gasLimit?: string;

    /**
     * Uniquely for Uniswap v2, defines which method to use - regular or supporting fee.
     */
    supportFee?: boolean;

    /**
     * Tron-transaction fee limit.
     */
    feeLimit?: number;
}
