import { UniswapV3AlgebraRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-route';
import { Token } from 'src/common/tokens';

export interface AlgebraRoute extends UniswapV3AlgebraRoute {
    /**
     * List of pools' contract addresses to use in a trade's route.
     */
    path: Token[];
}
