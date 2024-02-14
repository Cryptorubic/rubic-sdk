import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { Web3PrivateSupportedChainType } from 'src/core/blockchain/web3-private-service/models/web-private-supported-chain-type';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { SolanaWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/solana-web3-private/solana-web3-private';
import { TronWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/tron-web3-private';
import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';

export type Web3PrivateStorage = Record<Web3PrivateSupportedChainType, Web3Private | undefined> & {
    [CHAIN_TYPE.EVM]: EvmWeb3Private | undefined;
    [CHAIN_TYPE.TRON]: TronWeb3Private | undefined;
    [CHAIN_TYPE.SOLANA]: SolanaWeb3Private | undefined;
};
