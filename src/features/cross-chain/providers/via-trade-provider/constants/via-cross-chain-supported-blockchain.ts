import { BLOCKCHAIN_NAME } from 'src/core';

export const viaCrossChainSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.HARMONY,
    BLOCKCHAIN_NAME.MOONRIVER,
    BLOCKCHAIN_NAME.AURORA
] as const;

export type ViaCrossChainSupportedBlockchain = typeof viaCrossChainSupportedBlockchains[number];
