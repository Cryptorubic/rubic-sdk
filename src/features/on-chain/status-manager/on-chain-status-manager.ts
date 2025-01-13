import { waitFor } from 'src/common/utils/waitFor';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { Web3PublicSupportedBlockchain } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import { TX_STATUS } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { TxStatusData } from 'src/features/common/status-manager/models/tx-status-data';
import { getBridgersTradeStatus } from 'src/features/common/status-manager/utils/get-bridgers-trade-status';
import { getSrcTxStatus } from 'src/features/common/status-manager/utils/get-src-tx-status';

export class OnChainStatusManager {
    /**
     * Get Bridgers trade transaction status.
     */
    public async getBridgersSwapStatus(srcTxHash: string): Promise<TxStatusData> {
        const srcTxStatus = await getSrcTxStatus(BLOCKCHAIN_NAME.TRON, srcTxHash);
        if (srcTxStatus === TX_STATUS.FAIL) {
            return {
                status: TX_STATUS.FAIL,
                hash: srcTxHash
            };
        }

        return getBridgersTradeStatus(srcTxHash, BLOCKCHAIN_NAME.TRON, 'rubic_widget');
    }

    public static async getBitcoinTransaction(srcTxHash: string): Promise<TxStatusData> {
        return this.getSrcStatusRecursive(srcTxHash, BLOCKCHAIN_NAME.BITCOIN, 300_000);
    }

    private static async getSrcStatusRecursive(
        srcTxHash: string,
        blockchain: Web3PublicSupportedBlockchain,
        timeoutMs: number
    ): Promise<TxStatusData> {
        const srcTxStatus = await getSrcTxStatus(blockchain, srcTxHash);
        if (srcTxStatus === TX_STATUS.FAIL || srcTxStatus === TX_STATUS.SUCCESS) {
            return {
                status: srcTxStatus,
                hash: srcTxHash
            };
        }
        await waitFor(timeoutMs);

        return this.getSrcStatusRecursive(srcTxHash, blockchain, timeoutMs);
    }
}
