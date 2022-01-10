import { BLOCKCHAIN_NAME } from './BLOCKCHAIN_NAME';
import Web3 from 'web3';
export interface WalletConnectionConfiguration {
    web3: Web3;
    address: string;
    blockchainName: BLOCKCHAIN_NAME;
}
