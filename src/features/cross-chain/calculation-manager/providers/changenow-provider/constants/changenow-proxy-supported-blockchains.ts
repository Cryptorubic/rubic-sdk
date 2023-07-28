import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const changenowProxySupportedBlockchains = [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN] as const;

export type ChangenowProxySupportedBlockchain = (typeof changenowProxySupportedBlockchains)[number];
