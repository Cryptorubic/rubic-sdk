import BigNumber from 'bignumber.js';
import { BlockchainToken } from './blockchain-token';

export interface Token extends BlockchainToken {
    price?: BigNumber;
}
