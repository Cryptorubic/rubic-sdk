import { BLOCKCHAIN_NAME, EVM_BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const web3PrivateSupportedBlockchain = [
    ...Object.values(EVM_BLOCKCHAIN_NAME),
    BLOCKCHAIN_NAME.TRON,
    BLOCKCHAIN_NAME.SOLANA,
    BLOCKCHAIN_NAME.BITCOIN,
    BLOCKCHAIN_NAME.SUI
] as const;

export type Web3PrivateSupportedBlockchain = (typeof web3PrivateSupportedBlockchain)[number];
