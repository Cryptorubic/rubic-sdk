import { Token } from '@core/blockchain/models/token';
import BigNumber from 'bignumber.js';

export interface TokenAmount {
    token: Token;
    amount: BigNumber;
}
