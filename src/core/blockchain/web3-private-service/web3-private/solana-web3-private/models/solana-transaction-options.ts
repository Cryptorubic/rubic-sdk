import { BasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/models/basic-transaction-options';

export interface SolanaTransactionOptions extends BasicTransactionOptions {
    /**
     * Encoded data, which will be executed in transaction.
     */
    data?: string;
}
