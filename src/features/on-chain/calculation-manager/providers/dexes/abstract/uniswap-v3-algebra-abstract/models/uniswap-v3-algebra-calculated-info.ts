import BigNumber from 'bignumber.js';
import { UniswapV3AlgebraRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-route';

export interface UniswapV3AlgebraCalculatedInfo {
    route: UniswapV3AlgebraRoute;
    estimatedGas?: BigNumber;
}

export interface UniswapV3AlgebraCalculatedInfoWithProfit extends UniswapV3AlgebraCalculatedInfo {
    estimatedGas: BigNumber;
    profit: BigNumber;
}
