import {
    UniswapV3RouterConfiguration,
    UniswapV3RouterLiquidityPool
} from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v3-abstract/models/uniswap-v3-router-configuration';

/**
 * Most popular tokens in uni v3 to use in a route.
 */
const tokensSymbols = ['WETH', 'GMX', 'USDC', 'WBTC', 'DAI'] as const;

type TokenSymbol = typeof tokensSymbols[number];

const routerTokens: Record<TokenSymbol, string> = {
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    GMX: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
    USDC: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    WBTC: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
    DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'
};

const routerLiquidityPools: UniswapV3RouterLiquidityPool<TokenSymbol>[] = [
    {
        poolAddress: '0x80A9ae39310abf666A87C743d6ebBD0E8C42158E',
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'GMX',
        fee: 10000
    },
    {
        poolAddress: '0xC31E54c7a869B9FcBEcc14363CF510d1c41fa443',
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'USDC',
        fee: 500
    },
    {
        poolAddress: '0x149e36E72726e0BceA5c59d40df2c43F60f5A22D',
        tokenSymbolA: 'WBTC',
        tokenSymbolB: 'WETH',
        fee: 3000
    },
    {
        poolAddress: '0x17c14D2c404D167802b16C450d3c99F88F2c4F4d',
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'USDC',
        fee: 3000
    },
    {
        poolAddress: '0x2f5e87C9312fa29aed5c179E456625D79015299c',
        tokenSymbolA: 'WBTC',
        tokenSymbolB: 'WETH',
        fee: 500
    },
    {
        poolAddress: '0xd37Af656Abf91c7f548FfFC0133175b5e4d3d5e6',
        tokenSymbolA: 'DAI',
        tokenSymbolB: 'USDC',
        fee: 500
    }
];

export const UNI_SWAP_V3_ARBITRUM_ROUTER_CONFIGURATION: UniswapV3RouterConfiguration<TokenSymbol> =
    {
        tokens: routerTokens,
        liquidityPools: routerLiquidityPools
    };
