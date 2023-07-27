import { waitFor } from 'src/common/utils/waitFor';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { Web3PublicSupportedBlockchain } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import {
    TX_STATUS,
    TxStatus
} from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Injector } from 'src/core/injector/injector';

/**
 * Get cross-chain trade's source transaction status via receipt.
 * @returns Cross-chain transaction status.
 */
export async function getSrcTxStatus(
    fromBlockchain: Web3PublicSupportedBlockchain,
    srcTxHash: string
): Promise<TxStatus> {
    try {
        const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
        const status = await web3Public.getTransactionStatus(srcTxHash);
        if (status === TX_STATUS.FAIL && fromBlockchain === BLOCKCHAIN_NAME.ZK_SYNC) {
            const zkSyncAwarenessTime = 4000;
            await waitFor(zkSyncAwarenessTime);
            return web3Public.getTransactionStatus(srcTxHash);
        }
        return status;
    } catch {
        return TX_STATUS.PENDING;
    }
}
