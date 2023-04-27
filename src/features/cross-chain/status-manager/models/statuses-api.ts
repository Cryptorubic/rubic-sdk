import { TxStatusData } from 'src/features/common/status-manager/models/tx-status-data';
import { CelerTransferStatus } from 'src/features/cross-chain/status-manager/models/celer-transfer-status.enum';
import { CrossChainTradeData } from 'src/features/cross-chain/status-manager/models/cross-chain-trade-data';

export interface DeBridgeFilteredListApiResponse {
    orders: [
        {
            orderId: {
                stringValue: string;
            };
            state: string;
        }
    ];
}

export interface DeBridgeOrderApiResponse {
    fulfilledDstEventMetadata: {
        transactionHash: {
            stringValue: string;
        };
    };
}

export enum DeBridgeApiStateStatus {
    FULFILLED = 'Fulfilled',
    SENTUNLOCK = 'SentUnlock',
    CLAIMEDUNLOCK = 'ClaimedUnlock',
    ORDERCANCELLED = 'OrderCancelled',
    SENTORDERCANCEL = 'SentOrderCancel',
    CLAIMEDORDERCANCEL = 'ClaimedOrderCancel',
    CREATED = 'Created'
}

export interface SymbiosisApiResponse {
    status: {
        code: string;
        text: string;
    };
    tx: {
        hash: string;
        chainId: number;
    } | null;
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

export interface CelerXtransferStatusResponse {
    err: string;
    txSearchInfo: {
        transfer: {
            xfer_id: string;
            dst_tx_hash: string;
            xfer_status: CelerTransferStatus;
        }[];
    }[];
}

export type GetDstTxDataFn = (data: CrossChainTradeData) => Promise<TxStatusData>;
