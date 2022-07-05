import { BlockchainName } from '@rsdk-core/blockchain/models/blockchain-name';
import Web3 from 'web3';

export interface WalletConnectionConfiguration {
    web3: Web3;
    address: string;
    blockchainName: BlockchainName;
}
