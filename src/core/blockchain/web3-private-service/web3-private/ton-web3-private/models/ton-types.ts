import { BasicTransactionOptions } from '../../models/basic-transaction-options';

export interface TonTransactionOptions extends BasicTransactionOptions {
    messages: TonEncodedConfig[];
}

export interface TonEncodedConfig {
    /**
     * In default transfer - it's a receiverWalletAddress to send funds
     * In tx using contracts - it's a jettonWalletAddress (like ERC-20, but in TON)
     */
    address: string;
    /**
     * Amount to send in tx in nanotons
     * In default trasfer - it's a transfered value
     * In tx using contracts - it's static gasFee, by default toNano(0.05).toString()
     */
    amount: string;
    /**
     * Data for contract.
     * body.toBoc().toString('base64')
     */
    payload?: string;

    stateInit?: string;
}
