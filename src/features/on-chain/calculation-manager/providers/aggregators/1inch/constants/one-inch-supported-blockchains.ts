import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const oneInchSupportedBlockchains = [
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.BASE,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.KLAYTN,
    BLOCKCHAIN_NAME.OPTIMISM,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.PULSECHAIN,
    BLOCKCHAIN_NAME.ZK_SYNC
] as const;

export type OneInchSupportedBlockchains = (typeof oneInchSupportedBlockchains)[number];
