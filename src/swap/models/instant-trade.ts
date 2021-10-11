import BigNumber from 'bignumber.js';
import { Token } from '../../blockchain/models/token';

export interface InstantTrade {
    from: {
        token: Token;
        amount: BigNumber;
    };
    to: {
        token: Token;
        amount: BigNumber;
    };
    gasInfo: {
        gasLimit: string | null;
        gasPrice: string | null;
        gasFeeInUsd: BigNumber | null;
        gasFeeInEth: BigNumber | null;
    };
}

export interface Uniswapv2InstantTrade extends InstantTrade {
    path: string[];
    deadline: number;
    exact: 'input' | 'output';
    slippageTolerance: number;
}
