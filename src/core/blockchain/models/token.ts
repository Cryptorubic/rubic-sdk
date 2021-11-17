import { BlockchainToken } from '@core/blockchain/models/blockchain-token';
import BigNumber from 'bignumber.js';


export interface Token extends BlockchainToken {
    price?: BigNumber;
}
