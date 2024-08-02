export interface RetroBridgeQuoteSendParams {
    source_chain: string;
    destination_chain: string;
    asset_from: string;
    asset_to: string;
    amount: string;
}

export interface RetroBridgeQuoteResponse {
    amount_out: number;
    platform_fee: number;
    platform_fee_in_usd: number;
    blockchain_fee: number;
    blockchain_fee_in_usd: number;
    swap_fee: number;
    swap_fee_in_usd: number;
    full_fee: number;
    fee_asset: string;
}

export interface RetroBridgeTxSendParams extends RetroBridgeQuoteSendParams {
    receiver_wallet: string;
}

export interface RetroBridgeTxResponse {
    transaction_id: string;
    hot_wallet_address: string;
}
