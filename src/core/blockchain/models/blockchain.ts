import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { Token } from '@core/blockchain/tokens/token';

export interface Blockchain {
    id: number;
    name: BLOCKCHAIN_NAME;
    nativeCoin: Token;
}
