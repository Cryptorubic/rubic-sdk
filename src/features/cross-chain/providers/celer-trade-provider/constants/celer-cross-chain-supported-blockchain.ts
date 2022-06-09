import { BLOCKCHAIN_NAME } from '@core/blockchain/models/blockchain-name';

export const celerCrossChainSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.ARBITRUM
] as const;

export type CelerCrossChainSupportedBlockchain = typeof celerCrossChainSupportedBlockchains[number];
