import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const acrossCcrSupportedChains = [
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.BASE,
    BLOCKCHAIN_NAME.BLAST,
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.LINEA,
    BLOCKCHAIN_NAME.MODE,
    BLOCKCHAIN_NAME.OPTIMISM,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.SCROLL,
    BLOCKCHAIN_NAME.ZK_SYNC,
    BLOCKCHAIN_NAME.SONEIUM,
    BLOCKCHAIN_NAME.UNICHAIN
];

export type AccrossCcrSupportedChains = (typeof acrossCcrSupportedChains)[number];
