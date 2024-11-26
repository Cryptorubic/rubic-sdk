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
    'eUSDT',
    'WFLR',
    'sFLR',
    'eETH',
    'eQNT',
    'HLN',
    'APS',
    'BNZ',
    'USDC.e',
    'USDT',
    'cUSDX'
] as const;

type TokenSymbol = (typeof tokensSymbols)[number];

const routerTokens: Record<TokenSymbol, string> = {
    WFLR: wrappedNativeTokensList[BLOCKCHAIN_NAME.FLARE]!.address,
    sFLR: '0x12e605bc104e93b45e1ad99f9e555f659051c2bb',
    eUSDT: '0x96b41289d90444b8add57e6f265db5ae8651df29',
    eETH: '0xa76DCDdcE60a442d69Bac7158F3660f50921b122',
    eQNT: '0x60fDC7B744E886e96Aa0DEf5f69eE440dB9d8c77',
    HLN: '0x140D8d3649Ec605CF69018C627fB44cCC76eC89f',
    APS: '0xfF56Eb5b1a7FAa972291117E5E9565dA29bc808d',
    BNZ: '0xfD3449E8Ee31117a848D41Ee20F497a9bCb53164',
    'USDC.e': '0xfbda5f676cb37624f28265a144a48b0d6e87d3b6',
    USDT: '0x0b38e83b86d491735feaa0a791f65c2b99535396',
    cUSDX: '0xfe2907dfa8db6e320cdbf45f0aa888f6135ec4f8'
};

const routerLiquidityPools: UniswapV3RouterLiquidityPool<TokenSymbol>[] = [
    {
        poolAddress: '0x7666Ab2482257578113194b9A5e9D3bd7dC759d9',
        tokenSymbolA: 'HLN',
        tokenSymbolB: 'WFLR',
        fee: 3000
    },
    {
        poolAddress: '0x25B4f3930934F0A3CbB885C624EcEe75a2917144',
        tokenSymbolA: 'sFLR',
        tokenSymbolB: 'WFLR',
        fee: 500
    },
    {
        poolAddress: '0xAFF8e67248E81eb63941b7eF769758e42cEf9189',
        tokenSymbolA: 'WFLR',
        tokenSymbolB: 'APS',
        fee: 3000
    },
    {
        poolAddress: '0xcF93d54E7Fea895375667Fa071d5b48C81E76d7d',
        tokenSymbolA: 'eUSDT',
        tokenSymbolB: 'APS',
        fee: 3000
    },
    {
        poolAddress: '0xcAA52e02504E6C637E307e0a3d9675e659016CD8',
        tokenSymbolA: 'WFLR',
        tokenSymbolB: 'eUSDT',
        fee: 3000
    },
    {
        poolAddress: '0x71951DaC21f1f531C1b0F7F685875c269f7596F9',
        tokenSymbolA: 'eETH',
        tokenSymbolB: 'APS',
        fee: 3000
    },
    {
        poolAddress: '0xC9e27A759bFE2e518c133E1445B8b4D5DB05C824',
        tokenSymbolA: 'eQNT',
        tokenSymbolB: 'APS',
        fee: 3000
    },
    {
        poolAddress: '0x4dDC7854E0d3008D2B85e5Ed1529D726711ED05C',
        tokenSymbolA: 'sFLR',
        tokenSymbolB: 'APS',
        fee: 3000
    },
    {
        poolAddress: '0x5d03162f2623D98f21f30DD5024d0e6E243b0e3a',
        tokenSymbolA: 'sFLR',
        tokenSymbolB: 'eUSDT',
        fee: 3000
    },
    {
        poolAddress: '0x27A0B5C401B075679e60414c29e7F37FefBC8335',
        tokenSymbolA: 'eUSDT',
        tokenSymbolB: 'eETH',
        fee: 3000
    },
    {
        poolAddress: '0xebeA6Ac660313F03AB628c42747635b797337172',
        tokenSymbolA: 'eQNT',
        tokenSymbolB: 'eUSDT',
        fee: 3000
    },
    // {
    //     poolAddress: '0x32fd7858393918A984DA6ee279EcA27f630a1C02',
    //     tokenSymbolA: 'WFLR',
    //     tokenSymbolB: 'eETH',

    //     fee: 3000
    // },
    // {
    //     poolAddress: '0x7520005032F43229F606d3ACeae97045b9D6F7ea',
    //     tokenSymbolA: 'WFLR',
    //     tokenSymbolB: 'eUSDT',

    //     fee: 3000
    // },
    // {
    //     poolAddress: '0x80A08BbAbB0A5C51A9ae53211Df09EF23Debd4f3',
    //     tokenSymbolA: 'WFLR',
    //     tokenSymbolB: 'eQNT',

    //     fee: 3000
    // },
    // {
    //     poolAddress: '0xef24D5155818d4bD16AF0Cea1148A147eb620743',
    //     tokenSymbolA: 'WFLR',
    //     tokenSymbolB: 'APS',

    //     fee: 3000
    // },
    // {
    //     poolAddress: '0x69F4b2dab237d92893e9dF9a70ACbcEa6C6b3DE3',
    //     tokenSymbolA: 'HLN',
    //     tokenSymbolB: 'eETH',

    //     fee: 3000
    // },
    // {
    //     poolAddress: '0x9bD53eCB4B7C09f41a336F85C345aa8DcAFdf52C',
    //     tokenSymbolA: 'HLN',
    //     tokenSymbolB: 'eUSDT',

    //     fee: 3000
    // },
    // {
    //     poolAddress: '0x33E2354928002766C27F7424EcA6f9B133E922a5',
    //     tokenSymbolA: 'eQNT',
    //     tokenSymbolB: 'APS',

    //     fee: 3000
    // },
    // {
    //     poolAddress: '0x148DE4c1B0402b371B75EF97876E42C7eE4FDDA4',
    //     tokenSymbolA: 'eETH',
    //     tokenSymbolB: 'APS',

    //     fee: 3000
    // },
    // {
    //     poolAddress: '0x980Db8443D19B64B1d4616980ebbD44e7DD30C2E',
    //     tokenSymbolA: 'APS',
    //     tokenSymbolB: 'eUSDT',

    //     fee: 3000
    // },
    // {
    //     poolAddress: '0x2C934BbBD152A40419d3330e4d79f362Bc6691D6',
    //     tokenSymbolA: 'WFLR',
    //     tokenSymbolB: 'BNZ',

    //     fee: 3000
    // },
    {
        poolAddress: '0x164857e59CdE0848910Dac791650Da52db736dc2',
        tokenSymbolA: 'WFLR',
        tokenSymbolB: 'USDC.e',
        fee: 3000
    },
    {
        poolAddress: '0x4a885Ed3EC3F3E657440422e93C15A73EdF6A909',
        tokenSymbolA: 'USDT',
        tokenSymbolB: 'WFLR',
        fee: 3000
    },
    {
        poolAddress: '0x9ba3E13E581de917A6E5E0a70037628679d0dA3C',
        tokenSymbolA: 'USDT',
        tokenSymbolB: 'USDC.e',
        fee: 500
    },
    {
        poolAddress: '0x94fc6c22dD8f70c7FC9EB7830619E74Fed937E4c',
        tokenSymbolA: 'cUSDX',
        tokenSymbolB: 'USDC.e',
        fee: 500
    },
    {
        poolAddress: '0xe388298DFcc0Da8f81582E2c4F7Df92B46703a83',
        tokenSymbolA: 'HLN',
        tokenSymbolB: 'APS',
        fee: 3000
    },
    {
        poolAddress: '0xe6FbAB907141A578C51326C25300950a1C38B27c',
        tokenSymbolA: 'WFLR',
        tokenSymbolB: 'eQNT',
        fee: 3000
    },
    {
        poolAddress: '0x507Ba799d81c8e7848FA4e0c966bF96a7e28B5CD',
        tokenSymbolA: 'WFLR',
        tokenSymbolB: 'eETH',
        fee: 3000
    },
    {
        poolAddress: '0x5FFD30c3893F9606CfEC9c87BFf2988860678d17',
        tokenSymbolA: 'HLN',
        tokenSymbolB: 'eUSDT',
        fee: 3000
    },
    {
        poolAddress: '0xc41939F37B31BF1f2FCEFC1CA89B5bf46a8713D0',
        tokenSymbolA: 'HLN',
        tokenSymbolB: 'eETH',
        fee: 3000
    },
    {
        poolAddress: '0xBdd80C82000151f355e523FED0b5Fa32a07d12a1',
        tokenSymbolA: 'HLN',
        tokenSymbolB: 'eQNT',
        fee: 3000
    },
    {
        poolAddress: '0x942a493FE65172e42D276d07a612b678914EA402',
        tokenSymbolA: 'sFLR',
        tokenSymbolB: 'HLN',
        fee: 3000
    }
];

export const UNI_SWAP_V3_ENOSYS_FLARE_ROUTER_CONFIGURATION: UniswapV3RouterConfiguration<TokenSymbol> =
    {
        tokens: routerTokens,
        liquidityPools: routerLiquidityPools
    };
