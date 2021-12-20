import { FeeAmount } from '../models/liquidity-pool';
/**
 * Most popular tokens in uni v3 to use in a route.
 */
declare const tokensSymbols: readonly ["WETH", "USDT", "USDC", "WBTC", "DAI"];
declare type TokenSymbol = typeof tokensSymbols[number];
export declare const routerTokens: Record<TokenSymbol, string>;
interface RouterLiquidityPool {
    poolAddress: string;
    tokenSymbolA: TokenSymbol;
    tokenSymbolB: TokenSymbol;
    fee: FeeAmount;
}
export declare const routerLiquidityPools: RouterLiquidityPool[];
export {};
