export interface AcrossTxStatus {
    status: 'pending' | 'filled' | 'expired';
    fillTx?: string;
}
