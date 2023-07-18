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
    USDC: '0x67aE69Fd63b4fc8809ADc224A9b82Be976039509',
    DAI: '0x4702E5AEb70BdC05B11F8d8E701ad000dc85bD44',
    UNI: '0x0CDEA04b370C1FA4bC2032b4ef23dB3EBCbA258a'
};

const routerLiquidityPools: UniswapV3RouterLiquidityPool<TokenSymbol>[] = [];

export const UNI_SWAP_V3_SCROLL_TESTNET_ROUTER_CONFIGURATION: UniswapV3RouterConfiguration<TokenSymbol> =
    {
        tokens: routerTokens,
        liquidityPools: routerLiquidityPools
    };
