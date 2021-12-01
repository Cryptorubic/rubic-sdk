import BigNumber from 'bignumber.js';
import { UniswapRoute } from 'src/features/swap/trades/common/uniswap-v2/models/uniswap-route';

export interface UniswapCalculatedInfo {
    route: UniswapRoute;
    estimatedGas?: BigNumber;
}

export interface UniswapCalculatedInfoWithProfit extends UniswapCalculatedInfo {
    profit: BigNumber;
}
