/**
 * Stores options for transaction in `encode` function.
 */
export interface EncodeTransactionOptions {
    /**
     * User wallet address to send swap transaction.
     */
    fromAddress: string;

    receiverAddress?: string;
}
