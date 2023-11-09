import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const changenowProxySupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.OPTIMISM,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.PULSECHAIN,
    BLOCKCHAIN_NAME.BASE,
    BLOCKCHAIN_NAME.ZK_SYNC,
    BLOCKCHAIN_NAME.GOERLI,
    BLOCKCHAIN_NAME.MUMBAI,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET
] as const;

export type ChangenowProxySupportedBlockchain = (typeof changenowProxySupportedBlockchains)[number];
