import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const cbridgeSupportedBlockchains = [
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.AVALANCHE
] as const;

export type CbridgeCrossChainSupportedBlockchain = typeof cbridgeSupportedBlockchains[number];
