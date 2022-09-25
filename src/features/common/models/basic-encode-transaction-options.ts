/**
 * Stores options for transaction in `encode` function.
 */
export interface BasicEncodeTransactionOptions {
    /**
     * User wallet address to send swap transaction.
     */
    fromAddress: string;

    receiverAddress?: string;
}
