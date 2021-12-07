import BigNumber from 'bignumber.js';
import { UniSwapV3Route } from '@features/swap/providers/ethereum/uni-swap-v3/models/uni-swap-v3-route';

export interface UniSwapV3CalculatedInfo {
    route: UniSwapV3Route;
    gasLimit?: string;
}

export interface UniSwapV3CalculatedInfoWithProfit extends UniSwapV3CalculatedInfo {
    gasLimit: string;
    profit: BigNumber;
}
