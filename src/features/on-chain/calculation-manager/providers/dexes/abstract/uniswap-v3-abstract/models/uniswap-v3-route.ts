import { LiquidityPool } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v3-abstract/utils/quoter-controller/models/liquidity-pool';
import { UniswapV3AlgebraRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-route';

export interface UniswapV3Route extends UniswapV3AlgebraRoute {
    /**
     * List of pools' contract addresses to use in a trade's route.
     */
    poolsPath: LiquidityPool[];

    /**
     * From token address.
     */
    initialTokenAddress: string;
}
