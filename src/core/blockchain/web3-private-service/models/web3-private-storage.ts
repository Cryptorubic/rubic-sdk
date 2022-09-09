import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private';

export interface Web3PrivateStorage {
    [CHAIN_TYPE.EVM]?: EvmWeb3Private;
}
