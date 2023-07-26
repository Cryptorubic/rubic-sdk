export const TRANSFER_HISTORY_STATUS = {
    TRANSFER_UNKNOWN: 'TRANSFER_UNKNOWN',
    TRANSFER_SUBMITTING: 'TRANSFER_SUBMITTING',
    TRANSFER_FAILED: 'TRANSFER_FAILED',
    TRANSFER_WAITING_FOR_SGN_CONFIRMATION: 'TRANSFER_WAITING_FOR_SGN_CONFIRMATION',
    TRANSFER_WAITING_FOR_FUND_RELEASE: 'TRANSFER_WAITING_FOR_FUND_RELEASE',
    TRANSFER_COMPLETED: 'TRANSFER_COMPLETED',
    TRANSFER_TO_BE_REFUNDED: 'TRANSFER_TO_BE_REFUNDED',
    TRANSFER_REQUESTING_REFUND: 'TRANSFER_REQUESTING_REFUND',
    TRANSFER_REFUND_TO_BE_CONFIRMED: 'TRANSFER_REFUND_TO_BE_CONFIRMED',
    TRANSFER_CONFIRMING_YOUR_REFUND: 'TRANSFER_CONFIRMING_YOUR_REFUND',
    TRANSFER_REFUNDED: 'TRANSFER_REFUNDED'
} as const;

export type TransferHistoryStatus =
    (typeof TRANSFER_HISTORY_STATUS)[keyof typeof TRANSFER_HISTORY_STATUS];

export const XFER_STATUS = {
    UNKNOWN: 'UNKNOWN',
    OK_TO_RELAY: 'OK_TO_RELAY',
    SUCCESS: 'SUCCESS',
    BAD_LIQUIDITY: 'BAD_LIQUIDITY',
    BAD_SLIPPAGE: 'BAD_SLIPPAGE',
    BAD_TOKEN: 'BAD_TOKEN',
    REFUND_REQUESTED: 'REFUND_REQUESTED',
    REFUND_DONE: 'REFUND_DONE',
    BAD_XFER_DISABLED: 'BAD_XFER_DISABLED',
    BAD_DEST_CHAIN: 'BAD_DEST_CHAIN'
} as const;

export type XferStatus = (typeof XFER_STATUS)[keyof typeof XFER_STATUS];

export interface CbridgeStatusResponse {
    readonly err: null | string;
    readonly status: TransferHistoryStatus;
    readonly wd_onchain: string | null;
    readonly sorted_sigs: string[];
    readonly signers: string[];
    readonly powers: string[];
    readonly refund_reason: XferStatus;
    readonly block_delay: number;
    readonly src_block_tx_link: string;
    readonly dst_block_tx_link: string;
}
