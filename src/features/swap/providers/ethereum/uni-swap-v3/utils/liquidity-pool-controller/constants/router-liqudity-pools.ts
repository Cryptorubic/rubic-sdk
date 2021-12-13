import { LiquidityPool } from '@features/swap/providers/ethereum/uni-swap-v3/utils/liquidity-pool-controller/models/liquidity-pool';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { Token } from '@core/blockchain/tokens/token';

/**
 * Most popular tokens in uni v3 to use in a route.
 */
const tokensSymbols = ['WETH', 'USDT', 'USDC', 'WBTC', 'DAI'] as const;

type TokenSymbol = typeof tokensSymbols[number];

export const routerTokensAddresses: Record<TokenSymbol, string> = {
    WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    WBTC: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    DAI: '0x6b175474e89094c44da98b954eedeac495271d0f'
};

export async function getRouterTokensAndLiquidityPools(): Promise<{
    routerTokens: Token[];
    routerLiquidityPools: LiquidityPool[];
}> {
    const routerTokens: Token[] = await Token.createTokens(
        Object.values(routerTokensAddresses),
        BLOCKCHAIN_NAME.ETHEREUM
    );

    const routerTokensBySymbol = (Object.keys(routerTokensAddresses) as TokenSymbol[]).reduce(
        (acc, symbol, index) => ({
            ...acc,
            [symbol]: routerTokens[index]
        }),
        {} as Record<TokenSymbol, Token>
    );

    const routerLiquidityPools: LiquidityPool[] = [
        new LiquidityPool(
            '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8',
            routerTokensBySymbol.USDC,
            routerTokensBySymbol.WETH,
            3000
        ),
        new LiquidityPool(
            '0x7858E59e0C01EA06Df3aF3D20aC7B0003275D4Bf',
            routerTokensBySymbol.USDC,
            routerTokensBySymbol.USDT,
            500
        ),
        new LiquidityPool(
            '0xCBCdF9626bC03E24f779434178A73a0B4bad62eD',
            routerTokensBySymbol.WBTC,
            routerTokensBySymbol.WETH,
            3000
        ),
        new LiquidityPool(
            '0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36',
            routerTokensBySymbol.WETH,
            routerTokensBySymbol.USDT,
            3000
        ),
        new LiquidityPool(
            '0x6c6Bc977E13Df9b0de53b251522280BB72383700',
            routerTokensBySymbol.DAI,
            routerTokensBySymbol.USDC,
            500
        ),
        new LiquidityPool(
            '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
            routerTokensBySymbol.USDC,
            routerTokensBySymbol.WETH,
            500
        )
    ];

    return {
        routerTokens,
        routerLiquidityPools
    };
}
