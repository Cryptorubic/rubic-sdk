import BigNumber from 'bignumber.js';
import { LiquidityPool } from '@features/swap/dexes/ethereum/uni-swap-v3/utils/liquidity-pool-controller/models/liquidity-pool';
export interface UniSwapV3Route {
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
