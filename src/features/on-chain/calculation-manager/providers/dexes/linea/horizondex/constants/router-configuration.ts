import { wrappedNativeTokensList } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import {
    UniswapV3RouterConfiguration,
    UniswapV3RouterLiquidityPool
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/models/uniswap-v3-router-configuration';

/**
 * Most popular tokens in uni v3 to use in a route.
 */
const tokensSymbols = ['WETH', 'BNB', 'BUSD', 'MATIC', 'HZN', 'NFTE'] as const;

type TokenSymbol = (typeof tokensSymbols)[number];

const routerTokens: Record<TokenSymbol, string> = {
    WETH: wrappedNativeTokensList[BLOCKCHAIN_NAME.LINEA]!.address,
    BNB: '0xf5C6825015280CdfD0b56903F9F8B5A2233476F5',
    BUSD: '0x7d43AABC515C356145049227CeE54B608342c0ad',
    MATIC: '0x265b25e22bcd7f10a5bd6e6410f10537cc7567e8',
    HZN: '0x0B1A02A7309dFbfAD1Cd4adC096582C87e8A3Ac1',
    NFTE: '0x2140Ea50bc3B6Ac3971F9e9Ea93A1442665670e4'
};

const routerLiquidityPools: UniswapV3RouterLiquidityPool<TokenSymbol>[] = [
    {
        poolAddress: '0xe2df725e44ab983e8513ecfc9c3e13bc21ea867e',
        tokenSymbolA: 'BUSD',
        tokenSymbolB: 'WETH',
        fee: 300
    },
    {
        poolAddress: '0x0330fddd733ea64f92b348ff19a2bb4d29d379d5',
        tokenSymbolA: 'MATIC',
        tokenSymbolB: 'WETH',
        fee: 300
    },
    {
        poolAddress: '0xfe7a3ab43d8db17643ba5dc2f132a74049dcf42f',
        tokenSymbolA: 'BUSD',
        tokenSymbolB: 'BNB',
        fee: 300
    },
    {
        poolAddress: '0xa6a69fddec12e7ee44474a92e9c549a612519411',
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'BNB',
        fee: 300
    },
    {
        poolAddress: '0x0003ecc56c19953ea2e2de626e44111ade02ad6e',
        tokenSymbolA: 'HZN',
        tokenSymbolB: 'WETH',
        fee: 300
    },
    {
        poolAddress: '0xa24b6a8698ee173ccf5a97f73f1f2d8bb7032feb',
        tokenSymbolA: 'HZN',
        tokenSymbolB: 'WETH',
        fee: 1000
    },
    {
        poolAddress: '0xc9dc3eda8f6b664e2e25d632bb4d4f28ab58ee3c',
        tokenSymbolA: 'NFTE',
        tokenSymbolB: 'WETH',
        fee: 1000
    }
];

export const HORIZONDEX_ROUTER_CONFIGURATION: UniswapV3RouterConfiguration<TokenSymbol> = {
    tokens: routerTokens,
    liquidityPools: routerLiquidityPools
};
