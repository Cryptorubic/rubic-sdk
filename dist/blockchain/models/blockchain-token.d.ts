import { BLOCKCHAIN_NAME } from './BLOCKCHAIN_NAME';
export interface BlockchainToken {
    blockchain: BLOCKCHAIN_NAME;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
}
