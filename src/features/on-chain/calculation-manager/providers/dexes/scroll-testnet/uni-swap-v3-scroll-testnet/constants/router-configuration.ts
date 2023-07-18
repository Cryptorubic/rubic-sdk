import { wrappedNativeTokensList } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import {
    UniswapV3RouterConfiguration,
    UniswapV3RouterLiquidityPool
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/models/uniswap-v3-router-configuration';

/**
 * Most popular tokens in uni v3 to use in a route.
 */
const tokensSymbols = ['WETH', 'USDC', 'DAI', 'UNI'] as const;

type TokenSymbol = (typeof tokensSymbols)[number];

const routerTokens: Record<TokenSymbol, string> = {
    WETH: wrappedNativeTokensList[BLOCKCHAIN_NAME.SCROLL_TESTNET]!.address,
    // 0xa1ea0b2354f5a344110af2b6ad68e75545009a03
    USDC: '0x67aE69Fd63b4fc8809ADc224A9b82Be976039509',
    DAI: '0x4702E5AEb70BdC05B11F8d8E701ad000dc85bD44',
    UNI: '0x0CDEA04b370C1FA4bC2032b4ef23dB3EBCbA258a'
};

const routerLiquidityPools: UniswapV3RouterLiquidityPool<TokenSymbol>[] = [
    {
        poolAddress: '0xd33cb453ac9c69034365c7bf22e4afbada0fa4dd',
        tokenSymbolA: 'USDC',
        tokenSymbolB: 'WETH',
        fee: 3000
    },
    {
        poolAddress: '0x5c6a28124b8cc7091add3bdbd5591dc857b760d4',
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'DAI',
        fee: 3000
    },
    {
        poolAddress: '0x3d85b9063da55b3cb7cdf6d11ef8f3b0c282d6c2',
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'UNI',
        fee: 3000
    },
    {
        poolAddress: '0xb575c5b4d616a32f9669fecccdfa33eca9250913',
        tokenSymbolA: 'USDC',
        tokenSymbolB: 'DAI',
        fee: 3000
    },
    {
        poolAddress: '0xc8a882807d756af083db647fa05f9bcb8a8bb367',
        tokenSymbolA: 'USDC',
        tokenSymbolB: 'UNI',
        fee: 3000
    },
    {
        poolAddress: '0x8177bbbf8d174c204d10bd8aad43f136ef5ef462',
        tokenSymbolA: 'DAI',
        tokenSymbolB: 'UNI',
        fee: 3000
    }
];

export const UNI_SWAP_V3_SCROLL_TESTNET_ROUTER_CONFIGURATION: UniswapV3RouterConfiguration<TokenSymbol> =
    {
        tokens: routerTokens,
        liquidityPools: routerLiquidityPools
    };
