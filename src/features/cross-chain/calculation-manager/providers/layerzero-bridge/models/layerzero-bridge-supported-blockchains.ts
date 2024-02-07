import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const layerZeroBridgeSupportedBlockchains = [
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.ARBITRUM
] as const;

export type LayerZeroBridgeSupportedBlockchain =
    (typeof layerZeroBridgeSupportedBlockchains)[number];
