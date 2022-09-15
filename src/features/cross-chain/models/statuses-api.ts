import { CrossChainTradeData, CrossChainTxStatus } from 'src/features';
import { TransactionReceipt } from 'web3-eth';
import { CelerTransferStatus } from '../providers/common/celer-rubic/models/celer-swap-status.enum';

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

export interface CelerTransferHistoryResponse {
    err: string;
    next_page_token: string;
    current_size: string;
    history: {
        transferId: string;
        src_block_tx_link: string;
        dst_block_tx_link: string;
        status: CelerTransferStatus;
    }[];
}

export interface DstTxData {
    txStatus: CrossChainTxStatus;
    txHash: string | null;
}

export type getDstTxDataFn = (
    data: CrossChainTradeData,
    srcTxReceipt: TransactionReceipt
) => Promise<DstTxData>;
