import {
    UniswapV3RouterConfiguration,
    UniswapV3RouterLiquidityPool
} from '../../../common/uniswap-v3-abstract/models/uniswap-v3-router-configuration';

const tokensSymbols = [
    'WETH',
    'WBTC',
    'BRONTO',
    'MEGA',
    'RABBY',
    'USDC',
    'uksang',
    'PROM',
    'GTEN',
    'samu',
    'fNDR',
    'MEGIS',
    'MCt',
    'Sgn',
    'ROUTINE'
] as const;

type TokenSymbol = (typeof tokensSymbols)[number];

const routerTokens: Record<TokenSymbol, string> = {
    WETH: '0x4eB2Bd7beE16F38B1F4a0A5796Fffd028b6040e9',
    WBTC: '0xFE928dD7D9cda6bcF7f2600B4A0e9726AE4d2577',
    USDC: '0x8D635c4702BA38b1F1735e8e784c7265Dcc0b623',
    BRONTO: '0x9A9b33227FA5d386987A5892a7F0B730c9bA3E22',
    MEGA: '0xd02A3D7F7f3bA8E8dc4059b931B737B8ca59209A',
    RABBY: '0xbf66Cc6bCA1E70e365011d9Eb40ed09e8Dd90D19',
    uksang: '0x606667A06cf561b6b7f30a8E381dB2DD64CE1aEF',
    PROM: '0xF2F943e942d46D97d59486cb499C6D8B5a73093d',
    GTEN: '0xb9f1abee6a43d99E0D930c2c2AEea57Dd49dC3ef',
    samu: '0x3d5ff1342A881E9E13aEb162a2052e1c053C5564',
    fNDR: '0x01f5d711A7c0b8E7E6DB1F01DB26B4856dABb7A1',
    MEGIS: '0x612414635dE3c96B5D004d554595634D92F88Cf0',
    MCt: '0x2dAc420911bC96A45A81b6bf27EF13Bb50245973',
    Sgn: '0xB1e9F7e4B2AAB95ab2db925DCecF206e9946c4bC',
    ROUTINE: '0x8b3ADb6c2C0c8acd0A40E2250b17265952D69e49'
};

export const feeToTickSpacing: Record<number, number> = {
    3000: 200,
    500: 100
};
const routerLiquidityPools: UniswapV3RouterLiquidityPool<TokenSymbol>[] = [
    {
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'USDC',
        poolAddress: '0x7BcB8546F0cb1086B6511644310aa777cfEb3278',
        fee: 100
    },
    {
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'WBTC',
        poolAddress: '0x1d62DfE9ffD736B29734D118D863152E03b1e39D',
        fee: 200
    },
    {
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'BRONTO',
        poolAddress: '0xb9ab5eEbb627f9D084926105918C3Efe6DD60de9',
        fee: 200
    },
    {
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'MEGA',
        poolAddress: '0x1A9FC3232a7A2d3691EE62734aD529912630d499',
        fee: 200
    },
    {
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'RABBY',
        poolAddress: '0xfd3d58345b4ddD3e5e204Ca0c9940f81f3e0EC4d',
        fee: 200
    },
    {
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'uksang',
        poolAddress: '0xd228b02F04Ccc2D0e62319D301a746529c3700C8',
        fee: 200
    },
    {
        tokenSymbolA: 'USDC',
        tokenSymbolB: 'BRONTO',
        poolAddress: '0x86c87F29e20B1ECD6A178b1ae2D01fa08f5168ac',
        fee: 500
    },
    {
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'PROM',
        poolAddress: '0x548ab8A2097Abf4E2db28E5aA9100ede6A450524',
        fee: 200
    },
    {
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'GTEN',
        poolAddress: '0xbb253563E2147312d3703768870fFFd1721c85f2',
        fee: 200
    },
    {
        tokenSymbolA: 'samu',
        tokenSymbolB: 'WETH',
        poolAddress: '0xE1cf444D6e0d6A03AA86830f4fb298f9ad6A0de2',
        fee: 200
    },
    {
        tokenSymbolA: 'fNDR',
        tokenSymbolB: 'WETH',
        poolAddress: '0xEBeD93caca96f95a4b8248a48c5986fEAFf41208',
        fee: 200
    },
    {
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'MEGIS',
        poolAddress: '0x8217c66732Fd22d046a505Ce5A749c563543F783',
        fee: 200
    },
    {
        tokenSymbolA: 'MCt',
        tokenSymbolB: 'WETH',
        poolAddress: '0x4FCd40eFa0808e1B435c2FCDBDCB46c9ff94F432',
        fee: 200
    },
    {
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'Sgn',
        poolAddress: '0x122f1ae520a16804F175695B149678a06c0e4A5B',
        fee: 200
    },
    {
        tokenSymbolA: 'WETH',
        tokenSymbolB: 'ROUTINE',
        poolAddress: '0x6D173F5b11f77e84D9B163B65213912100c23E75',
        fee: 200
    }
];

export const MEGAETH_TESTNET_ROUTER_CONFIGURATION: UniswapV3RouterConfiguration<TokenSymbol> = {
    tokens: routerTokens,
    liquidityPools: routerLiquidityPools
};
