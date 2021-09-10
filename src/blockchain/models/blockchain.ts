import { BLOCKCHAIN_NAME } from './BLOCKCHAIN_NAME';
import { BlockchainToken } from './blockchain-token';

export interface Blockchain {
    id: number;
    name: BLOCKCHAIN_NAME;
    label: string;
    scannerUrl: string;
    rpcLink: string;
    nativeCoin: BlockchainToken;
}
