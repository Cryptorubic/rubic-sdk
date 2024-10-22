import { SimpleSwapTxStatus } from './simple-swap-tx-status';

export interface SimpleSwapEstimatonRequest {
    fixed: boolean;
    currency_from: string;
    currency_to: string;
    amount: string;
}

export type SimpleSwapRangesRequest = Omit<SimpleSwapEstimatonRequest, 'amount'>;

export type SimpleSwapExchangeRequest = SimpleSwapEstimatonRequest & {
    address_to: string;
    extra_id_to: string;
    user_refund_address: string;
    user_refund_extra_id: string;
};

export interface SimpleSwapExchange {
    /* used for checking tx-status */
    id: string;
    type: 'fixed' | 'floating';
    timestamp: string;
    updated_at: string;
    valid_until: string;
    currency_from: string;
    currency_to: string;
    amount_from: string;
    expected_amount: string;
    amount_to: string;
    address_from: string;
    address_to: string;
    extra_id_from: string;
    extra_id_to: string;
    user_refund_address: string;
    user_refund_extra_id: string;
    tx_from: string;
    tx_to: string;
    status: SimpleSwapTxStatus;
}
