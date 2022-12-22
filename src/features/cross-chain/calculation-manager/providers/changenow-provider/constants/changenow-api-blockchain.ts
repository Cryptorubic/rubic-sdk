import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { ChangenowCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-cross-chain-supported-blockchain';

export const changenowApiBlockchain: Record<ChangenowCrossChainSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: 'eth',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'bsc',
    [BLOCKCHAIN_NAME.POLYGON]: 'matic',
    [BLOCKCHAIN_NAME.ICP]: 'icp'
};
