import { PriceToken, PriceTokenAmount } from 'src/core';
import { UniswapV3AlgebraRoute } from '@features/swap/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-route';

export interface UniswapV3AlgebraQuoterController {
    getAllRoutes(
        from: PriceTokenAmount,
        toToken: PriceToken,
        routeMaxTransitPools: number
    ): Promise<UniswapV3AlgebraRoute[]>;
}
