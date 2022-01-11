import BigNumber from 'bignumber.js';
import { AlgebraRoute } from '@features/swap/dexes/polygon/algebra/models/algebra-route';
import { UniswapV3Route } from '@features/swap/dexes/common/uniswap-v3-abstract/models/uniswap-v3-route';

export interface UniswapV3AlgebraCalculatedInfo {
    route: UniswapV3Route | AlgebraRoute;
    estimatedGas?: BigNumber;
}

export interface UniswapV3AlgebraCalculatedInfoWithProfit extends UniswapV3AlgebraCalculatedInfo {
    estimatedGas: BigNumber;
    profit: BigNumber;
}
