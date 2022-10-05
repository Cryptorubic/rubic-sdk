import BigNumber from 'bignumber.js';
import { UniswapRoute } from 'src/features/on-chain/providers/dexes/abstract/uniswap-v2-abstract/models/uniswap-route';

export interface UniswapCalculatedInfo {
    route: UniswapRoute;
    estimatedGas?: BigNumber;
}

export interface UniswapCalculatedInfoWithProfit extends UniswapCalculatedInfo {
    profit: BigNumber;
}
