import { PriceTokenAmount } from '../../../../../../../core/blockchain/tokens/price-token-amount';
import { PriceToken } from '../../../../../../../core/blockchain/tokens/price-token';
import { LiquidityPool } from './models/liquidity-pool';
import { Web3Public } from '../../../../../../../core/blockchain/web3-public/web3-public';
import { UniSwapV3Route } from '../../models/uni-swap-v3-route';
/**
 * Works with requests, related to Uniswap v3 liquidity pools.
 */
export declare class LiquidityPoolsController {
    private readonly web3Public;
    /**
     * Converts uni v3 route to encoded bytes string to pass it to contract.
     * Structure of encoded string: '0x${tokenAddress_0}${toHex(fee_0)}${tokenAddress_1}${toHex(fee_1)}...${tokenAddress_n}.
     * toHex(fee_i) must be of length 6, so leading zeroes are added.
     * @param pools Liquidity pools, included in route.
     * @param initialTokenAddress From token address.
     * @return string Encoded string.
     */
    static getEncodedPoolsPath(pools: LiquidityPool[], initialTokenAddress: string): string;
    /**
     * Returns swap method's name and arguments to pass it to Quoter contract.
     * @param poolsPath Pools, included in the route.
     * @param from From token and amount.
     * @param toToken To token.
     */
    private static getQuoterMethodData;
    private routerTokens;
    private routerLiquidityPools;
    private readonly feeAmounts;
    constructor(web3Public: Web3Public);
    private getRouterTokensAndLiquidityPools;
    /**
     * Returns all liquidity pools, containing passed tokens addresses, and concatenates with most popular pools.
     */
    private getAllLiquidityPools;
    /**
     * Returns all routes between given tokens with output amount.
     * @param from From token and amount.
     * @param toToken To token.
     * @param routeMaxTransitPools Max amount of transit pools.
     */
    getAllRoutes(from: PriceTokenAmount, toToken: PriceToken, routeMaxTransitPools: number): Promise<UniSwapV3Route[]>;
    /**
     * Returns swap methods' names and arguments, built with passed pools' addresses, to use it in Quoter contract.
     */
    private getQuoterMethodsData;
}
