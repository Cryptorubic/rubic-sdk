import { Transaction } from '@mysten/sui/transactions';
import { BasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/models/basic-transaction-options';

export interface SuiTransactionOptions extends BasicTransactionOptions {
    transactionBlock: Transaction;
}
