import { wrappedNativeTokensList } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import {
    UniswapV3RouterConfiguration,
    UniswapV3RouterLiquidityPool
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/models/uniswap-v3-router-configuration';

/**
 * Most popular tokens in uni v3 to use in a route.
 */
const tokensSymbols = ['WETH', 'USDC', 'GHO'] as const;

type TokenSymbol = (typeof tokensSymbols)[number];

const routerTokens: Record<TokenSymbol, string> = {
    WETH: wrappedNativeTokensList[BLOCKCHAIN_NAME.SCROLL_SEPOLIA]!.address,
    USDC: '0x15Fe86961428E095B064bb52FcF5964bAb834E34',
    GHO: '0xD9692f1748aFEe00FACE2da35242417dd05a8615'
};

const routerLiquidityPools: UniswapV3RouterLiquidityPool<TokenSymbol>[] = [
    {
        poolAddress: '0x60ba72f15c2b133e8ef826602bab511f4c7bca78',
        tokenSymbolA: 'USDC',
        tokenSymbolB: 'WETH',
        fee: 3000
    },
    {
        poolAddress: '0xd8ac608580a56fdea4f1d9ef2ce5e4fa09591325',
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'GHO',
        fee: 3000
    }
];

export const UNI_SWAP_V3_SCROLL_SEPOLIA_ROUTER_CONFIGURATION: UniswapV3RouterConfiguration<TokenSymbol> =
    {
        tokens: routerTokens,
        liquidityPools: routerLiquidityPools
    };
