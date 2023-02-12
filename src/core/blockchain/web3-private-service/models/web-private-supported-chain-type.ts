import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';

export const web3PrivateSupportedChainTypes = [CHAIN_TYPE.EVM, CHAIN_TYPE.TRON] as const;

export type Web3PrivateSupportedChainType = (typeof web3PrivateSupportedChainTypes)[number];
