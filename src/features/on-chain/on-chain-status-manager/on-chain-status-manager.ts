import { DstTxData } from 'src/features/cross-chain/cross-chain-status-manager/models/statuses-api';
import { getBridgersTradeStatus } from 'src/features/common/providers/bridgers/utils/get-bridgers-trade-status';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export class OnChainStatusManager {
    /**
     * Get Bridgers trade transaction status.
     */
    public getBridgersSwapStatus(srcTxHash: string): Promise<DstTxData> {
        return getBridgersTradeStatus(srcTxHash, BLOCKCHAIN_NAME.TRON, 'rubic_widget');
    }
}
