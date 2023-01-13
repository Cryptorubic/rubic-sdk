export enum TransferHistoryStatus {
    TRANSFER_UNKNOWN,
    TRANSFER_SUBMITTING,
    TRANSFER_FAILED,
    TRANSFER_WAITING_FOR_SGN_CONFIRMATION,
    TRANSFER_WAITING_FOR_FUND_RELEASE,
    TRANSFER_COMPLETED,
    TRANSFER_TO_BE_REFUNDED,
    TRANSFER_REQUESTING_REFUND,
    TRANSFER_REFUND_TO_BE_CONFIRMED,
    TRANSFER_CONFIRMING_YOUR_REFUND,
    TRANSFER_REFUNDED
}

export enum XferStatus {
    UNKNOWN,
    OK_TO_RELAY,
    SUCCESS,
    BAD_LIQUIDITY,
    BAD_SLIPPAGE,
    BAD_TOKEN,
    REFUND_REQUESTED,
    REFUND_DONE,
    BAD_XFER_DISABLED,
    BAD_DEST_CHAIN
}

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
