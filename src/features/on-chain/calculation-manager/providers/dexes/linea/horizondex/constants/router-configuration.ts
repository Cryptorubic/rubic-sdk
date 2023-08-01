import { wrappedNativeTokensList } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import {
    UniswapV3RouterConfiguration,
    UniswapV3RouterLiquidityPool
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/models/uniswap-v3-router-configuration';

/**
 * Most popular tokens in uni v3 to use in a route.
 */
const tokensSymbols = ['WETH', 'BNB', 'BUSD', 'AVAX', 'MATIC', 'deUSDC'] as const;

type TokenSymbol = (typeof tokensSymbols)[number];

const routerTokens: Record<TokenSymbol, string> = {
    WETH: wrappedNativeTokensList[BLOCKCHAIN_NAME.LINEA]!.address,
    BNB: '0xf5C6825015280CdfD0b56903F9F8B5A2233476F5',
    BUSD: '0x7d43AABC515C356145049227CeE54B608342c0ad',
    AVAX: '0x5471ea8f739dd37e9b81be9c5c77754d8aa953e4',
    MATIC: '0x265b25e22bcd7f10a5bd6e6410f10537cc7567e8',
    deUSDC: '0x66627f389ae46d881773b7131139b2411980e09e'
};

const routerLiquidityPools: UniswapV3RouterLiquidityPool<TokenSymbol>[] = [
    {
        poolAddress: '0xe2df725e44ab983e8513ecfc9c3e13bc21ea867e',
        tokenSymbolA: 'BUSD',
        tokenSymbolB: 'WETH',
        fee: 3000
    },
    {
        poolAddress: '0x0330fddd733ea64f92b348ff19a2bb4d29d379d5',
        tokenSymbolA: 'MATIC',
        tokenSymbolB: 'WETH',
        fee: 500
    },
    {
        poolAddress: '0xfe7a3ab43d8db17643ba5dc2f132a74049dcf42f',
        tokenSymbolA: 'BUSD',
        tokenSymbolB: 'BNB',
        fee: 3000
    },
    {
        poolAddress: '0xa6a69fddec12e7ee44474a92e9c549a612519411',
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'BNB',
        fee: 3000
    },
    {
        poolAddress: '0x76f12b1b0ff9a53810894f94b31ee2569e0d9bc4',
        tokenSymbolA: 'AVAX',
        tokenSymbolB: 'WETH',
        fee: 500
    },
    {
        poolAddress: '0x77557405a645c79e9f8b0096997b6a247b12b315',
        tokenSymbolA: 'deUSDC',
        tokenSymbolB: 'WETH',
        fee: 500
    }
];

export const HORIZONDEX_ROUTER_CONFIGURATION: UniswapV3RouterConfiguration<TokenSymbol> = {
    tokens: routerTokens,
    liquidityPools: routerLiquidityPools
};
