import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { LayerZeroBridgeSupportedBlockchain } from '../models/layerzero-bridge-supported-blockchains';

export const ALGB_TOKEN = {
    [BLOCKCHAIN_NAME.ARBITRUM]: '0x9f018bda8f6b507a0c9e6f290b2f7c49c2f8daf8',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xe374116f490b461764e2438f98eab3fff383367b',
    [BLOCKCHAIN_NAME.POLYGON]: '0x0169ec1f8f639b32eec6d923e24c2a2ff45b9dd6'
} as Record<LayerZeroBridgeSupportedBlockchain, string>;
