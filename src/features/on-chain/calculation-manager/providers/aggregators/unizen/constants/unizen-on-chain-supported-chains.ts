import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const unizenOnChainSupportedChains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.OPTIMISM,
    BLOCKCHAIN_NAME.BASE
];

export type UnizenOnChainSupportedChains = (typeof unizenOnChainSupportedChains)[number];
