import BigNumber from 'bignumber.js';
import { UniSwapV3Route } from './uni-swap-v3-route';
export interface UniSwapV3CalculatedInfo {
    route: UniSwapV3Route;
    estimatedGas?: BigNumber;
}
export interface UniSwapV3CalculatedInfoWithProfit extends UniSwapV3CalculatedInfo {
    estimatedGas: BigNumber;
    profit: BigNumber;
}
