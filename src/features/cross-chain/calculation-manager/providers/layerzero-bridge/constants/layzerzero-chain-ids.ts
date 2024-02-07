import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { LayerZeroBridgeSupportedBlockchain } from '../models/layerzero-bridge-supported-blockchains';

export const layerZeroChainIds = {
    [BLOCKCHAIN_NAME.ARBITRUM]: '110',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '102',
    [BLOCKCHAIN_NAME.POLYGON]: '109'
} as Record<LayerZeroBridgeSupportedBlockchain, string>;
