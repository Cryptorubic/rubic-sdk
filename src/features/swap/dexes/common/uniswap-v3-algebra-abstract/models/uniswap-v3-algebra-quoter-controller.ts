import { PriceToken, PriceTokenAmount } from 'src/core';
import { AlgebraRoute } from '@features/swap/dexes/polygon/algebra/models/algebra-route';
import { UniswapV3Route } from '@features/swap/dexes/common/uniswap-v3-abstract/models/uniswap-v3-route';

export interface UniswapV3AlgebraQuoterController {
    getAllRoutes(
        from: PriceTokenAmount,
        toToken: PriceToken,
        routeMaxTransitPools: number
    ): Promise<(UniswapV3Route | AlgebraRoute)[]>;
}
