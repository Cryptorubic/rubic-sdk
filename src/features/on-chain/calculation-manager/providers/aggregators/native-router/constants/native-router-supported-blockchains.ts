import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const nativeRouterSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.MANTLE,
    BLOCKCHAIN_NAME.BASE,
    BLOCKCHAIN_NAME.SCROLL,
    BLOCKCHAIN_NAME.MANTA_PACIFIC,
    BLOCKCHAIN_NAME.ZK_LINK,
    BLOCKCHAIN_NAME.LINEA
] as const;

export type NativeRouterSupportedBlockchains = (typeof nativeRouterSupportedBlockchains)[number];
