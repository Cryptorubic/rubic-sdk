import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const lifiCrossChainSupportedBlockchains = [
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.FANTOM
] as const;

export type LifiCrossChainSupportedBlockchain = typeof lifiCrossChainSupportedBlockchains[number];
