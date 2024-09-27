export const RETRO_BRIDGE_TX_STATUS = {
    PENDING: 'pending',
    WAIT_DEPOSIT: 'wait deposit',
    DEPOSITED: 'deposited',
    SENDING: 'sending',
    SENT: 'sent',
    COMPLETED: 'completed',
    SEND_FAILED: 'send failed',
    REJECTED: 'rejected'
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
