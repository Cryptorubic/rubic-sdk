export interface CbridgeEstimateAmountResponse {
    readonly eq_value_token_amt: string;
    readonly bridge_rate: number;
    readonly perc_fee: string;
    readonly base_fee: string;
    readonly slippage_tolerance: number;
    readonly max_slippage: number;
    readonly estimated_receive_amt: string;
}
