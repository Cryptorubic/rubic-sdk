import { Address } from 'viem';

export interface TronTransactionInfo {
    id: string;
    fee: number;
    blockNumber: number;
    blockTimeStamp: number;
    contractResult: string[];
    contract_address: string;
    receipt: {
        energy_usage: number;
        energy_fee: number;
        origin_energy_usage: number;
        energy_usage_total: number;
        net_usage: number;
        net_fee: number;
        result: string;
        energy_penalty_total: number;
    };
    log: {
        address: Address;
        topics: string[];
        data: string;
    }[];
    result?: 'FAILED';
    resMessage: string;
    withdraw_amount: number;
    unfreeze_amount: number;
    withdraw_expire_amount: number;
    exchange_id: string;
}
