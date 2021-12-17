import { BLOCKCHAIN_NAME } from './BLOCKCHAIN_NAME';
import { Token } from '../tokens/token';
export interface Blockchain {
    id: number;
    name: BLOCKCHAIN_NAME;
    nativeCoin: Token;
}
