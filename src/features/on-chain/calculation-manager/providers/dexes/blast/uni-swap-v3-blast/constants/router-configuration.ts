import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import {
    UniswapV3RouterConfiguration,
    UniswapV3RouterLiquidityPool
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/models/uniswap-v3-router-configuration';

/**
 * Most popular tokens in uni v3 to use in a route.
 */
const tokensSymbols = ['WETH', 'USDB', 'axlUSDC', 'WBTC', 'USD+'] as const;

type TokenSymbol = (typeof tokensSymbols)[number];

const routerTokens: Record<TokenSymbol, string> = {
    WETH: wrappedNativeTokensList[BLOCKCHAIN_NAME.BLAST]!.address,
    USDB: '0x4300000000000000000000000000000000000003',
    axlUSDC: '0xEB466342C4d449BC9f53A865D5Cb90586f405215',
    WBTC: '0xF7bc58b8D8f97ADC129cfC4c9f45Ce3C0E1D2692',
    'USD+': '0x4fEE793d435c6D2c10C135983BB9d6D4fC7B9BBd'
};

const routerLiquidityPools: UniswapV3RouterLiquidityPool<TokenSymbol>[] = [
    {
        poolAddress: '0x1d74611f3ef04e7252f7651526711a937aa1f75e',
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'USDB',
        fee: 3000
    },
    {
        poolAddress: '0x1fe38ea700f0b8b013be01e58b02b1da3956379a',
        tokenSymbolA: 'USDB',
        tokenSymbolB: 'axlUSDC',
        fee: 3000
    },
    {
        poolAddress: '0x86d1da56fc79accc0daf76ca75668a4d98cb90a7',
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'axlUSDC',
        fee: 3000
    },
    {
        poolAddress: '0xc066a3e5d7c22bd3beaf74d4c0925520b455bb6f',
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'WBTC',
        fee: 3000
    },
    {
        poolAddress: '0xc5910a7f3b0119ac1a3ad7a268cce4a62d8c882d',
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'USD+',
        fee: 3000
    }
];

export const UNI_SWAP_V3_BLAST_ROUTER_CONFIGURATION: UniswapV3RouterConfiguration<TokenSymbol> = {
    tokens: routerTokens,
    liquidityPools: routerLiquidityPools
};

export const UNI_SWAP_V3_BLAST_SWAP_ROUTER_CONTRACT_ADDRESS =
    '0x0998bEc51D95EAa75Ffdf465D5deD16aEd2ba2fe';
