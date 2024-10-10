import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { RetroBridgeSupportedBlockchain } from './retro-bridge-supported-blockchain';

export const retroBridgeBlockchainTickers: Partial<Record<RetroBridgeSupportedBlockchain, string>> =
    {
        [BLOCKCHAIN_NAME.ETHEREUM]: 'ETHEREUM',
        [BLOCKCHAIN_NAME.ZETACHAIN]: 'ZETA_CHAIN',
        [BLOCKCHAIN_NAME.XLAYER]: 'X_LAYER',
        [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: 'ZKEVM',
        [BLOCKCHAIN_NAME.MANTA_PACIFIC]: 'MANTA',
        [BLOCKCHAIN_NAME.ZK_LINK]: 'ZK_LINK_NOVA',
        [BLOCKCHAIN_NAME.ZK_SYNC]: 'ZKSYNC'
    };
