import { TxStatus } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';

/**
 * Object representing status of cross-chain trade.
 * Consists of source transaction status, destination transaction status and destination transaction hash.
 */
export interface CrossChainStatus {
    /**
     * Status of source transaction.
     */
    srcTxStatus: TxStatus;

    /**
     * Status of destination transaction.
     */
    dstTxStatus: TxStatus;

    /**
     * Transaction hash on destination chain.
     */
    dstTxHash: string | null;

    /* Contains additional info for specific providers */
    extraInfo?: {
        mesonSwapId: string;
    };
}
