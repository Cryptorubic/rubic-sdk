import { FeeAmount } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v3-abstract/utils/quoter-controller/models/liquidity-pool';

export interface UniswapV3RouterLiquidityPool<TokenSymbol extends string> {
    poolAddress: string;
    tokenSymbolA: TokenSymbol;
    tokenSymbolB: TokenSymbol;
    fee: FeeAmount;
}

export interface UniswapV3RouterConfiguration<TokenSymbol extends string> {
    readonly tokens: Record<TokenSymbol, string>;
    readonly liquidityPools: UniswapV3RouterLiquidityPool<TokenSymbol>[];
}
