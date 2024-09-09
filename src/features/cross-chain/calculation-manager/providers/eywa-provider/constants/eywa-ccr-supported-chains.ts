import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const eywaCrossChainSupportedChains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.OPTIMISM,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
] as const;

export type EywaCcrSupportedChains = (typeof eywaCrossChainSupportedChains)[number];
