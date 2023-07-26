import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
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
}
