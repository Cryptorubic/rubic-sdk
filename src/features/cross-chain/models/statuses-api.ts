import { CrossChainTradeData, CrossChainTxStatus } from 'src/features';
import { TransactionReceipt } from 'web3-eth';

export interface DeBridgeApiResponse {
    claim: {
        transactionHash?: string;
    } | null;
    send: {
        isExecuted: boolean;
        confirmationsCount: number;
        transactionHash: string;
    } | null;
}

export interface SymbiosisApiResponse {
    status: {
        code: string;
        text: string;
    };
    tx: {
        hash: string;
        chainId: number;
    };
}

export interface BtcStatusResponse {
    block_height: number | undefined;
    block_index: number | undefined;
    double_spend: boolean;
    fee: number;
    hash: string;
    inputs: unknown[];
    lock_time: number;
    out: unknown[];
    relayed_by: string;
    size: number;
    time: number;
    tx_index: number;
    ver: number;
    vin_sz: number;
    vout_sz: number;
    weight: number;
}

export type getDstTxStatusFn = (
    data: CrossChainTradeData,
    srcTxReceipt: TransactionReceipt
) => Promise<CrossChainTxStatus>;
