export interface TronTransactionInfo {
    blockNumber: number;
    blockTimeStamp: number;
    contract_address: string;
    fee: number;
    id: string;
    receipt: { energy_fee: number; energy_usage_total: number; net_fee: number; result: string };
    resMessage: string;
    result: string;
}
