import { BlockchainName } from '@core/blockchain/models/blockchain-name';

export interface TokenBaseStruct {
    address: string;
    blockchain: BlockchainName;
}
