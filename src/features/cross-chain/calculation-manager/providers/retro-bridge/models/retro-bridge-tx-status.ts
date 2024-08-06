export const RETRO_BRIDGE_TX_STATUS = {
    PENDING: 'Pending',
    WAIT_DEPOSIT: 'Wait deposit',
    DEPOSITED: 'Deposited',
    SENDING: 'Sending',
    SENT: 'Sent',
    COMPLETED: 'Completed',
    SEND_FAILED: 'Send failed',
    REJECTED: 'Rejected'
} as const;

export type RetroBridgeTxStatus =
    (typeof RETRO_BRIDGE_TX_STATUS)[keyof typeof RETRO_BRIDGE_TX_STATUS];

export interface RetroBridgeStatusResponse {
    data: {
        status: RetroBridgeTxStatus;
        destination_tx_hash: string;
        source_tx_hash: string;
    };
}
