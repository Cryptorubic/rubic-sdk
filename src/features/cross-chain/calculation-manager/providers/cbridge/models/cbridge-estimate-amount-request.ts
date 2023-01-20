export interface CbridgeEstimateAmountRequest {
    readonly src_chain_id: number;
    readonly dst_chain_id: number;
    readonly token_symbol: string;
    readonly usr_addr?: string;
    readonly slippage_tolerance: number;
    readonly amt: string;
    readonly is_pegged?: boolean;
}
