import { BasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/models/basic-transaction-options';

export interface TronTransactionOptions extends BasicTransactionOptions {
    feeLimit?: number;

    callValue?: number;

    rawParameter?: string;
}
