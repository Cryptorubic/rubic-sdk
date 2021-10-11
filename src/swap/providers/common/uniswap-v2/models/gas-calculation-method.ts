import BigNumber from 'bignumber.js';
import { BatchCall } from '../../../../../blockchain/web3-public/models/batch-call';
import { InternalUniswapV2Trade } from './uniswap-v2-trade';

export type GasCalculationMethod = (trade: InternalUniswapV2Trade) => {
    callData: BatchCall;
    defaultGasLimit: BigNumber;
};
