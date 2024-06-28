import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const eddyBridgeSupportedChains = [
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.ZETACHAIN,
    BLOCKCHAIN_NAME.ETHEREUM
] as const;

export type EddyBridgeSupportedTokens = 'ETH' | 'BNB' | 'ZETA';

export type EddyBridgeSupportedChain = (typeof eddyBridgeSupportedChains)[number];
export type TssAvailableEddyBridgeChain = Exclude<EddyBridgeSupportedChain, 'ZETACHAIN'>;
