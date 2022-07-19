import { CrossChainTxStatus } from './cross-chain-tx-status';

export interface CrossChainStatus {
    srcTxStatus: CrossChainTxStatus;
    dstTxStatus: CrossChainTxStatus;
}
