import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { Web3Private } from 'src/core';

export interface Web3PrivateStorage {
    [CHAIN_TYPE.EVM]?: Web3Private;
}
