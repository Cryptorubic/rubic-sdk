import { CrossChainTxStatus } from './cross-chain-tx-status';

/**
 * Object representing status of cross-chain trade.
 * Consists of source transaction status and destination transaction status.
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
}
