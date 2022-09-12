import BigNumber from 'bignumber.js';
import { UniswapRoute } from 'src/features/instant-trades/dexes/common/uniswap-v2-abstract/models/uniswap-route';

export interface UniswapCalculatedInfo {
    route: UniswapRoute;
    estimatedGas?: BigNumber;
}

export interface UniswapCalculatedInfoWithProfit extends UniswapCalculatedInfo {
    profit: BigNumber;
}
