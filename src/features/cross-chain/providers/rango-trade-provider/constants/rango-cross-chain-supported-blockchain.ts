import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';

export const rangoCrossChainSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.OPTIMISM
] as const;

export type RangoCrossChainSupportedBlockchain = typeof rangoCrossChainSupportedBlockchains[number];
