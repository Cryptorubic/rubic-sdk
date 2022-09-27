import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { TronWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/tron-web3-private';
import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import { Web3PrivateSupportedChainType } from 'src/core/blockchain/web3-private-service/models/web-private-supported-chain-type';

export interface Web3PrivateStorage
    extends Record<Web3PrivateSupportedChainType, Web3Private | undefined> {
    [CHAIN_TYPE.EVM]: EvmWeb3Private | undefined;
    [CHAIN_TYPE.TRON]: TronWeb3Private | undefined;
}
