import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const odosSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.ZK_SYNC,
    BLOCKCHAIN_NAME.BASE,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.OPTIMISM,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.LINEA,
    BLOCKCHAIN_NAME.MANTLE,
    BLOCKCHAIN_NAME.MODE,
    BLOCKCHAIN_NAME.SCROLL
] as const;

export type OdosSupportedBlockchain = (typeof odosSupportedBlockchains)[number];
