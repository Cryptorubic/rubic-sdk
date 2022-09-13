import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private';
import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';

export const web3PrivateSupportedChainTypes = [CHAIN_TYPE.EVM] as const;

export type Web3PrivateSupportedChainType = typeof web3PrivateSupportedChainTypes[number];

export interface Web3PrivateStorage
    extends Record<Web3PrivateSupportedChainType, Web3Private | undefined> {
    [CHAIN_TYPE.EVM]: EvmWeb3Private | undefined;
}
