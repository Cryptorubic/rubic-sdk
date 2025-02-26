import { wrappedAddress } from 'src/common/tokens/constants/wrapped-addresses';
import {
    UniswapV3RouterConfiguration,
    UniswapV3RouterLiquidityPool
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/models/uniswap-v3-router-configuration';

/**
 * Most popular tokens in uni v3 to use in a route.
 */
const tokensSymbols = ['PI', 'WETH', 'USDC', 'UNI', 'UNICORN', 'UNIDOGE', '1$', 'TINY'] as const;

type TokenSymbol = (typeof tokensSymbols)[number];

const routerTokens: Record<TokenSymbol, string> = {
    PI: '0x20f17D48646D57764334B6606d85518680D4e276',
    WETH: wrappedAddress.UNICHAIN!,
    USDC: '0x078D782b760474a361dDA0AF3839290b0EF57AD6',
    UNI: '0x8f187aA05619a017077f5308904739877ce9eA21',
    UNICORN: '0x926DC7b96bb2F4A91C2A67e291Faf482691a3001',
    UNIDOGE: '0xa84A8Acc04CD47e18bF5Af826aB00D5026552EA5',
    '1$': '0xAA7f7F072eeab9446568a6D7AEb977725AD2F557',
    TINY: '0xD7C28129Baf6E11e4F3516B212c50b44cF4e1D6A'
};

const routerLiquidityPools: UniswapV3RouterLiquidityPool<TokenSymbol>[] = [
    {
        poolAddress: '0xDD7a791E31cAC6804051185E83151062BdD73030',
        tokenSymbolA: 'PI',
        tokenSymbolB: 'WETH',
        fee: 3000
    },
    {
        poolAddress: '0x5B16de420B1d093b962C0Bc03DD91b6D423f8c4a',
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'UNICORN',
        fee: 3000
    },
    {
        poolAddress: '0xFC420995985d962b7c330Ed7f9F17ffd58186BDE',
        tokenSymbolA: 'WETH',
        tokenSymbolB: '1$',
        fee: 3000
    },
    {
        poolAddress: '0x6b918c9F87B46a758C2B51bce427C8028DaCb720',
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'UNIDOGE',
        fee: 3000
    },
    {
        poolAddress: '0x65081CB48d74A32e9CCfED75164b8c09972DBcF1',
        tokenSymbolA: 'USDC',
        tokenSymbolB: 'WETH',
        fee: 3000
    },
    {
        poolAddress: '0xa9c6669dE2C04C2ADb22Ac7A65D75B47FEe30E35',
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'TINY',
        fee: 3000
    }
];

export const UNI_SWAP_V3_UNICHAIN_ROUTER_CONFIGURATION: UniswapV3RouterConfiguration<TokenSymbol> =
    {
        tokens: routerTokens,
        liquidityPools: routerLiquidityPools
    };
