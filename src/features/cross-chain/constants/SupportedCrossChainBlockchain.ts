import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';

export const supportedCrossChainBlockchain = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.MOONRIVER,
    BLOCKCHAIN_NAME.FANTOM
] as const;

export type SupportedCrossChainBlockchain = typeof supportedCrossChainBlockchain[number];
