import {
    UniswapV3RouterConfiguration,
    UniswapV3RouterLiquidityPool
} from '../../../common/uniswap-v3-abstract/models/uniswap-v3-router-configuration';

const tokensSymbols = [
    'WVANA',
    'USDC.e',
    'GDP',
    'MIND',
    'VOL',
    'FIN',
    'SIX',
    'WETH',
    'VFSN'
] as const;

type TokenSymbol = (typeof tokensSymbols)[number];

const routerTokens: Record<TokenSymbol, string> = {
    WVANA: '0x00eddd9621fb08436d0331c149d1690909a5906d',
    'USDC.e': '0xf1815bd50389c46847f0bda824ec8da914045d14',
    GDP: '0xf8f97a79a3fa77104fab4814e3ed93899777de0d',
    MIND: '0xd561ce710ff7ce7d93fd7b1f0ff1b1989fe7256e',
    VOL: '0xeb68ef0550a5532447da0fea4f0ed9f804803b8b',
    FIN: '0x1becf440e8bcfc78cdfd45f29f7b1dc04df7777c',
    SIX: '0x84f8dc1ada73298281387e62616470f3dd5df2f6',
    WETH: '0x2f6f07cdcf3588944bf4c42ac74ff24bf56e7590',
    VFSN: '0x0cc1bc0131dd9782e65ca0319cd3a60eba3a932d'
};

const routerLiquidityPools: UniswapV3RouterLiquidityPool<TokenSymbol>[] = [
    {
        tokenSymbolA: 'WVANA',
        tokenSymbolB: 'USDC.e',
        poolAddress: '0x850e454ddebf9f61ef5a86a032c857e0e47c4fa9',
        fee: 3000
    },
    {
        tokenSymbolA: 'WVANA',
        tokenSymbolB: 'GDP',
        poolAddress: '0x960f741ecd17768fd91c386099ae7be1bfcb56f3',
        fee: 3000
    },
    {
        tokenSymbolA: 'WVANA',
        tokenSymbolB: 'MIND',
        poolAddress: '0xfbdd88936e0ae5ad810df7f8ca6c38114fa27bf6',
        fee: 3000
    },
    {
        tokenSymbolA: 'WVANA',
        tokenSymbolB: 'VOL',
        poolAddress: '0x5f77aac938ef1cda2e0e4ce11725eeccef4981c8',
        fee: 3000
    },
    {
        tokenSymbolA: 'WVANA',
        tokenSymbolB: 'FIN',
        poolAddress: '0xe5e953b7b9c034d35393dce58092df9d74eb1c3c',
        fee: 3000
    },
    {
        tokenSymbolA: 'WVANA',
        tokenSymbolB: 'SIX',
        poolAddress: '0x2c856dc8aae173be498471b948ea4eea1702afed',
        fee: 3000
    },
    {
        tokenSymbolA: 'WVANA',
        tokenSymbolB: 'WETH',
        poolAddress: '0xe21b165bcd93251b71db4a55e4e8f234b3391d74',
        fee: 3000
    },
    {
        tokenSymbolA: 'WVANA',
        tokenSymbolB: 'VFSN',
        poolAddress: '0x710344a5c8d60959efde9da3e359b1a87872a766',
        fee: 3000
    }
];

export const DATA_DEX_ROUTER_CONFIGURATION: UniswapV3RouterConfiguration<TokenSymbol> = {
    tokens: routerTokens,
    liquidityPools: routerLiquidityPools
};
