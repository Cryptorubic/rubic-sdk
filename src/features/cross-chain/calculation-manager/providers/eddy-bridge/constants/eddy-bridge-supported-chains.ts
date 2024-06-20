import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const eddySupportedChains = [
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.ZETACHAIN,
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BITCOIN
] as const;

export type EddySupportedChain = (typeof eddySupportedChains)[number];
