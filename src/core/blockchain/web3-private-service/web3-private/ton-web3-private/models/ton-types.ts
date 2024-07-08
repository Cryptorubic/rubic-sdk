import { Cell } from '@ton/core';

import { BasicTransactionOptions } from '../../models/basic-transaction-options';

export interface TonTransactionOptions extends BasicTransactionOptions {
    /**
     * TON cells to create transaction-payload
     */
    txBody: Cell;

    /**
     * In default trasfer - it's a transfered value
     * In tx using contracts - it's static gasFee, by default toNano(0.05).toString()
     */
    transferAmount?: string;

    /**
     * In default transfer - it's a receiverWalletAddress to send funds in  format "0:41241077...."
     * In tx using contracts - it's a jettonWalletAddress (like ERC-20, but in TON)
     */
    to?: string;
}
