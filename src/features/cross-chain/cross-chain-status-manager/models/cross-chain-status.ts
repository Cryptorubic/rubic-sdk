import { CrossChainTxStatus } from 'src/features/cross-chain/cross-chain-status-manager/models/cross-chain-tx-status';

/**
 * Object representing status of cross-chain trade.
 * Consists of source transaction status, destination transaction status and destination transaction hash.
 */
export interface CrossChainStatus {
    /**
     * Status of source transaction.
     */
    srcTxStatus: CrossChainTxStatus;

    /**
     * Status of destination transaction.
     */
    dstTxStatus: CrossChainTxStatus;

    /**
     * Transaction hash on destination chain.
     */
    dstTxHash: string | null;
}
