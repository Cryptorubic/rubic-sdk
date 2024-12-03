import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import {
    UniswapV3RouterConfiguration,
    UniswapV3RouterLiquidityPool
} from '../../../../common/uniswap-v3-abstract/models/uniswap-v3-router-configuration';

/**
 * Most popular tokens in uni v3 to use in a route.
 */
const tokensSymbols = [
    'USDC.e',
    'WFLR',
    'sFLR',
    'WETH',
    'USDT',
    'flrETH',
    'JOULE',
    'cUSDX'
] as const;

type TokenSymbol = (typeof tokensSymbols)[number];

const routerTokens: Record<TokenSymbol, string> = {
    WFLR: wrappedNativeTokensList[BLOCKCHAIN_NAME.FLARE]!.address,
    WETH: '0x1502fa4be69d526124d453619276faccab275d3d',
    sFLR: '0x12e605bc104e93b45e1ad99f9e555f659051c2bb',
    USDT: '0x0b38e83b86d491735feaa0a791f65c2b99535396',
    'USDC.e': '0xfbda5f676cb37624f28265a144a48b0d6e87d3b6',
    flrETH: '0x26a1fab310bd080542dc864647d05985360b16a5',
    JOULE: '0xe6505f92583103af7ed9974dec451a7af4e3a3be',
    cUSDX: '0xfe2907dfa8db6e320cdbf45f0aa888f6135ec4f8'
};

const routerLiquidityPools: UniswapV3RouterLiquidityPool<TokenSymbol>[] = [
    {
        poolAddress: '0xc9baba3f36ccaa54675deecc327ec7eaa48cb97d',
        tokenSymbolA: 'sFLR',
        tokenSymbolB: 'WFLR',
        fee: 100
    },
    {
        poolAddress: '0x07154de9814383e75dd7dd2a2e25b072d4b27116',
        tokenSymbolA: 'USDT',
        tokenSymbolB: 'USDC.e',
        fee: 100
    },
    {
        poolAddress: '0xa8697b82a5e9f108296c6299859e82472340aea7',
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'flrETH',
        fee: 500
    },
    {
        poolAddress: '0x9a3215f8b0d128816f75175c9fd74e7ebbd987da',
        tokenSymbolA: 'sFLR',
        tokenSymbolB: 'WFLR',
        fee: 500
    },
    {
        poolAddress: '0xe6505f92583103af7ed9974dec451a7af4e3a3be',
        tokenSymbolA: 'sFLR',
        tokenSymbolB: 'JOULE',
        fee: 3000
    },
    {
        poolAddress: '0x3Bc1eCbcd645e525508c570A0fF04480a5614a86',
        tokenSymbolA: 'WFLR',
        tokenSymbolB: 'USDC.e',
        fee: 500
    },
    {
        poolAddress: '0x8CD69c359806af83120bc4b4e77663f1E31553e7',
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'USDC.e',
        fee: 500
    },
    {
        poolAddress: '0x0d807ad839d4e5bff3378f15da795d9135e8ce30',
        tokenSymbolA: 'WFLR',
        tokenSymbolB: 'USDC.e',
        fee: 100
    },
    {
        poolAddress: '0x4a78c16660c97a041a1b2b860cce717a23a319e2',
        tokenSymbolA: 'WFLR',
        tokenSymbolB: 'WETH',
        fee: 3000
    },
    {
        poolAddress: '0x53676e77e352dc28eb86a3ccbc19a3ed7b63e304',
        tokenSymbolA: 'USDC.e',
        tokenSymbolB: 'cUSDX',
        fee: 100
    }
];

export const UNI_SWAP_V3_SPARK_DEX_FLARE_ROUTER_CONFIGURATION: UniswapV3RouterConfiguration<TokenSymbol> =
    {
        tokens: routerTokens,
        liquidityPools: routerLiquidityPools
    };
