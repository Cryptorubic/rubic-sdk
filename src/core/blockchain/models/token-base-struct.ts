import { BlockchainName } from '@rsdk-core/blockchain/models/blockchain-name';

export interface TokenBaseStruct {
    address: string;
    blockchain: BlockchainName;
}
