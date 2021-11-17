import BigNumber from 'bignumber.js';
import { Token } from '@core/blockchain/models/token';

export abstract class InstantTrade {
    public abstract from: {
        token: Token;
        amount: BigNumber;
    };

    public abstract to: {
        token: Token;
        amount: BigNumber;
    };

    public abstract gasInfo: {
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
