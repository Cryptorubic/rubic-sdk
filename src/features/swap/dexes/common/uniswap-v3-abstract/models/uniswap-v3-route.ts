import BigNumber from 'bignumber.js';
import { LiquidityPool } from '@features/swap/dexes/common/uniswap-v3-abstract/utils/quoter-controller/models/liquidity-pool';

export interface UniswapV3Route {
    /**
     * Resulting value in Wei.
     */
    outputAbsoluteAmount: BigNumber;

    /**
     * List of pools' contract addresses to use in a trade's route.
     */
    poolsPath: LiquidityPool[];

    /**
     * From token address.
     */
    initialTokenAddress: string;
}
