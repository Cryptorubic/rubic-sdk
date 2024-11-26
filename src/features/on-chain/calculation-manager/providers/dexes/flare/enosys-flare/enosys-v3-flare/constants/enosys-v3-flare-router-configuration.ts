import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import {
    UniswapV3RouterConfiguration,
    UniswapV3RouterLiquidityPool
} from '../../../../common/uniswap-v3-abstract/models/uniswap-v3-router-configuration';

/**
 * Most popular tokens in uni v3 to use in a route.
 */
const tokensSymbols = ['eUSDT', 'WFLR', 'sFLR', 'eETH', 'eQNT', 'HLN', 'APS', 'BNZ'] as const;

type TokenSymbol = (typeof tokensSymbols)[number];

const routerTokens: Record<TokenSymbol, string> = {
    WFLR: wrappedNativeTokensList[BLOCKCHAIN_NAME.FLARE]!.address,
    sFLR: '0x12e605bc104e93b45e1ad99f9e555f659051c2bb',
    eUSDT: '0x96b41289d90444b8add57e6f265db5ae8651df29',
    eETH: '0xa76DCDdcE60a442d69Bac7158F3660f50921b122',
    eQNT: '0x60fDC7B744E886e96Aa0DEf5f69eE440dB9d8c77',
    HLN: '0x140D8d3649Ec605CF69018C627fB44cCC76eC89f',
    APS: '0xfF56Eb5b1a7FAa972291117E5E9565dA29bc808d',
    BNZ: '0xfD3449E8Ee31117a848D41Ee20F497a9bCb53164'
};

const routerLiquidityPools: UniswapV3RouterLiquidityPool<TokenSymbol>[] = [
    {
        poolAddress: '0x7E8EB77Feb4b3Fe2C58B493DF6Ce38875806bebb',
        tokenSymbolA: 'WFLR',
        tokenSymbolB: 'sFLR',
        fee: 3000
    },
    {
        poolAddress: '0xDf243D5631A68fDa74Db6572D7649aD341470c82',
        tokenSymbolA: 'sFLR',
        tokenSymbolB: 'eUSDT',
        fee: 3000
    },
    {
        poolAddress: '0x68cB5Bf8c9A54d664d9b6b483fC6A6401448223e',
        tokenSymbolA: 'sFLR',
        tokenSymbolB: 'eETH',
        fee: 3000
    },
    {
        poolAddress: '0xb7C6F8cff4D5B7266225f624e03a27BE0998C726',
        tokenSymbolA: 'sFLR',
        tokenSymbolB: 'eQNT',
        fee: 3000
    },
    {
        poolAddress: '0x6CbF760115F66502838B5622423D68DBCb4A9757',
        tokenSymbolA: 'sFLR',
        tokenSymbolB: 'HLN',
        fee: 3000
    },
    {
        poolAddress: '0xf06eeBF7A66C80760Bd8343A6BCe84c9D61879ee',
        tokenSymbolA: 'sFLR',
        tokenSymbolB: 'APS',
        fee: 3000
    },
    {
        poolAddress: '0x32fd7858393918A984DA6ee279EcA27f630a1C02',
        tokenSymbolA: 'WFLR',
        tokenSymbolB: 'eETH',
        fee: 3000
    },
    {
        poolAddress: '0x7520005032F43229F606d3ACeae97045b9D6F7ea',
        tokenSymbolA: 'WFLR',
        tokenSymbolB: 'eUSDT',
        fee: 3000
    },
    {
        poolAddress: '0x80A08BbAbB0A5C51A9ae53211Df09EF23Debd4f3',
        tokenSymbolA: 'WFLR',
        tokenSymbolB: 'eQNT',
        fee: 3000
    },
    {
        poolAddress: '0xef24D5155818d4bD16AF0Cea1148A147eb620743',
        tokenSymbolA: 'WFLR',
        tokenSymbolB: 'APS',
        fee: 3000
    },
    {
        poolAddress: '0xEd920325b7dB1e909DbE2d562fCD07f714395e10',
        tokenSymbolA: 'HLN',
        tokenSymbolB: 'eQNT',
        fee: 3000
    },
    {
        poolAddress: '0x69F4b2dab237d92893e9dF9a70ACbcEa6C6b3DE3',
        tokenSymbolA: 'HLN',
        tokenSymbolB: 'eETH',
        fee: 3000
    },
    {
        poolAddress: '0x9bD53eCB4B7C09f41a336F85C345aa8DcAFdf52C',
        tokenSymbolA: 'HLN',
        tokenSymbolB: 'eUSDT',
        fee: 3000
    },
    {
        poolAddress: '0x02C6b5B1fbE01Da872E21f9Dab1B980933B0EF27',
        tokenSymbolA: 'HLN',
        tokenSymbolB: 'WFLR',
        fee: 3000
    },
    {
        poolAddress: '0x87E0E33558c8e8EAE3c1E9EB276e05574190b48a',
        tokenSymbolA: 'HLN',
        tokenSymbolB: 'APS',
        fee: 3000
    },
    {
        poolAddress: '0x33E2354928002766C27F7424EcA6f9B133E922a5',
        tokenSymbolA: 'eQNT',
        tokenSymbolB: 'APS',
        fee: 3000
    },
    {
        poolAddress: '0x148DE4c1B0402b371B75EF97876E42C7eE4FDDA4',
        tokenSymbolA: 'eETH',
        tokenSymbolB: 'APS',
        fee: 3000
    },
    {
        poolAddress: '0x980Db8443D19B64B1d4616980ebbD44e7DD30C2E',
        tokenSymbolA: 'APS',
        tokenSymbolB: 'eUSDT',
        fee: 3000
    },
    {
        poolAddress: '0x2C934BbBD152A40419d3330e4d79f362Bc6691D6',
        tokenSymbolA: 'WFLR',
        tokenSymbolB: 'BNZ',
        fee: 3000
    }
];

export const UNI_SWAP_V3_ENOSYS_FLARE_ROUTER_CONFIGURATION: UniswapV3RouterConfiguration<TokenSymbol> =
    {
        tokens: routerTokens,
        liquidityPools: routerLiquidityPools
    };
