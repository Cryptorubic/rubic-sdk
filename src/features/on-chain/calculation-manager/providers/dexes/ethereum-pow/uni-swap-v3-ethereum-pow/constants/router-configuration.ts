import { wrappedNativeTokensList } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import {
    UniswapV3RouterConfiguration,
    UniswapV3RouterLiquidityPool
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/models/uniswap-v3-router-configuration';

/**
 * Most popular tokens in uni v3 to use in a route.
 */
const tokensSymbols = ['WETH', 'USDT', 'USDC', 'WBTC', 'DAI'] as const;

type TokenSymbol = (typeof tokensSymbols)[number];

const routerTokens: Record<TokenSymbol, string> = {
    WETH: wrappedNativeTokensList[BLOCKCHAIN_NAME.ETHEREUM_POW]!.address,
    USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    WBTC: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    DAI: '0x6b175474e89094c44da98b954eedeac495271d0f'
};

const routerLiquidityPools: UniswapV3RouterLiquidityPool<TokenSymbol>[] = [
    {
        poolAddress: '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8',
        tokenSymbolA: 'USDC',
        tokenSymbolB: 'WETH',
        fee: 3000
    },
    {
        poolAddress: '0x7858E59e0C01EA06Df3aF3D20aC7B0003275D4Bf',
        tokenSymbolA: 'USDC',
        tokenSymbolB: 'USDT',
        fee: 500
    },
    {
        poolAddress: '0xCBCdF9626bC03E24f779434178A73a0B4bad62eD',
        tokenSymbolA: 'WBTC',
        tokenSymbolB: 'WETH',
        fee: 3000
    },
    {
        poolAddress: '0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36',
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'USDT',
        fee: 3000
    },
    {
        poolAddress: '0x6c6Bc977E13Df9b0de53b251522280BB72383700',
        tokenSymbolA: 'DAI',
        tokenSymbolB: 'USDC',
        fee: 500
    },
    {
        poolAddress: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
        tokenSymbolA: 'USDC',
        tokenSymbolB: 'WETH',
        fee: 500
    }
];

export const UNI_SWAP_V3_ETHEREUM_POW_ROUTER_CONFIGURATION: UniswapV3RouterConfiguration<TokenSymbol> =
    {
        tokens: routerTokens,
        liquidityPools: routerLiquidityPools
    };
