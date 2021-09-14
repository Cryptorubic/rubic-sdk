import BigNumber from 'bignumber.js';
import { Token } from '../../blockchain/models/token';
import { SwapOptions } from './swap-options';

export interface InstantTrade {
    fromToken: Token;
    fromAmount: BigNumber;
    toToken: Token;
    toAmount: BigNumber;
    options: SwapOptions;
    gasInfo: {
        gasLimit?: string;
        gasPrice?: string;
        gasFeeInUsd?: BigNumber;
        gasFeeInEth?: BigNumber;
    };
}
