import {
    UniswapV3RouterConfiguration,
    UniswapV3RouterLiquidityPool
} from '../../../common/uniswap-v3-abstract/models/uniswap-v3-router-configuration';

const tokensSymbols = [
    'WBERA',
    'WETH',
    'STONE',
    'WBTC',
    'beraETH',
    'HONEY',
    'uniBTC',
    'USDe',
    'USDC.e',
    'USD₮0'
] as const;

type TokenSymbol = (typeof tokensSymbols)[number];

const routerTokens: Record<TokenSymbol, string> = {
    WBERA: '0x6969696969696969696969696969696969696969',
    WETH: '0x2f6f07cdcf3588944bf4c42ac74ff24bf56e7590',
    STONE: '0xec901da9c68e90798bbbb74c11406a32a70652c3',
    WBTC: '0x0555e30da8f98308edb960aa94c0db47230d2b9c',
    beraETH: '0x6fc6545d5cde268d5c7f1e476d444f39c995120d',
    HONEY: '0xfcbd14dc51f0a4d49d5e53c2e0950e0bc26d0dce',
    uniBTC: '0xc3827a4bc8224ee2d116637023b124ced6db6e90',
    USDe: '0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34',
    'USDC.e': '0x549943e04f40284185054145c6e4e9568c1d3241',
    'USD₮0': '0x779ded0c9e1022225f8e0630b35a9b54be713736'
};

const routerLiquidityPools: UniswapV3RouterLiquidityPool<TokenSymbol>[] = [
    {
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'STONE',
        poolAddress: '0x8382fbcebef31da752c72885a61d4416f342c6c8',
        fee: 500
    },
    {
        tokenSymbolA: 'WBTC',
        tokenSymbolB: 'WETH',
        poolAddress: '0x3c098ca2e84143742a7dcec3a341cabdd706412b',
        fee: 3000
    },
    {
        tokenSymbolA: 'beraETH',
        tokenSymbolB: 'STONE',
        poolAddress: '0xcb7142f79d4ec5329a6a99bc9aaac84525652426',
        fee: 500
    },
    {
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'HONEY',
        poolAddress: '0x9eb897d400f245e151dafd4c81176397d7798c9c',
        fee: 3000
    },
    {
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'beraETH',
        poolAddress: '0x7b29fd049ed07c21038f1bc6aa85071961ba51ff',
        fee: 500
    },
    {
        tokenSymbolA: 'WBTC',
        tokenSymbolB: 'HONEY',
        poolAddress: '0x545bea6ea7f8fd8dcc5c9a6802a8ebf3dbfc1c6e',
        fee: 3000
    },
    {
        tokenSymbolA: 'USDe',
        tokenSymbolB: 'HONEY',
        poolAddress: '0x9e4c460645b39628c631003eb9911651d5441dd8',
        fee: 500
    },
    {
        tokenSymbolA: 'USDC.e',
        tokenSymbolB: 'HONEY',
        poolAddress: '0x610d4f0eca45cb04cc576bed0e547139213720e9',
        fee: 500
    },
    {
        tokenSymbolA: 'USD₮0',
        tokenSymbolB: 'HONEY',
        poolAddress: '0x357817efaed68bd1ccc9034e963485040a822a8b',
        fee: 500
    },
    {
        tokenSymbolA: 'WBTC',
        tokenSymbolB: 'uniBTC',
        poolAddress: '0xec2411329487619ec698a27743f168ca133af296',
        fee: 500
    },
    {
        tokenSymbolA: 'WBERA',
        tokenSymbolB: 'HONEY',
        poolAddress: '0x1127f801cb3ab7bdf8923272949aa7dba94b5805',
        fee: 3000
    },
    {
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'WBERA',
        poolAddress: '0xcda0ca7c3a609773067261d86e817bf777a2870d',
        fee: 3000
    },
    {
        tokenSymbolA: 'USDC.e',
        tokenSymbolB: 'WBERA',
        poolAddress: '0xa6956e09a67c9e0d70dc47d6eb438e134823c439',
        fee: 10000
    }
];

export const KODIAK_V3_ROUTER_CONFIGURATION: UniswapV3RouterConfiguration<TokenSymbol> = {
    tokens: routerTokens,
    liquidityPools: routerLiquidityPools
};
