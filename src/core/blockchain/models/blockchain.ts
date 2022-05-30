import { BlockchainName } from '@core/blockchain/models/blockchain-name';
import { Token } from '@core/blockchain/tokens/token';

export interface Blockchain {
    id: number;
    name: BlockchainName;
    nativeCoin: Token;
}
