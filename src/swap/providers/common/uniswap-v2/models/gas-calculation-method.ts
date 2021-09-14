import BigNumber from 'bignumber.js';
import { BatchCall } from '../../../../../blockchain/web3-public/models/batch-call';

export type GasCalculationMethod = (
    amountIn: string,
    amountOutMin: string,
    path: string[],
    deadline: number
) => { callData: BatchCall; defaultGasLimit: BigNumber };
