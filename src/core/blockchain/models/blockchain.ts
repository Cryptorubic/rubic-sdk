import { BlockchainToken } from '@core/blockchain/models/blockchain-token';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';

export interface Blockchain {
    id: number;
    name: BLOCKCHAIN_NAME;
    nativeCoin: BlockchainToken;
}
