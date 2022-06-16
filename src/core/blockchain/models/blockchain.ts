import { BlockchainName } from '@rsdk-core/blockchain/models/blockchain-name';
import { Token } from '@rsdk-core/blockchain/tokens/token';

export interface Blockchain {
    id: number;
    name: BlockchainName;
    nativeCoin: Token;
}
