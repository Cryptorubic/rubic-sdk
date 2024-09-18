import { Address } from '@ton/core';

export type DedustPoolsResponse = [DedustApiPoolInfo[]];

interface DedustApiPoolInfo {
    pool: {
        address: string;
        isStable: boolean;
        assets: [string, string];
        reserves: [string, string];
    };
    assetIn: string;
    assetOut: string;
    tradeFee: string;
    amountIn: string;
    amountOut: string;
}

export interface DedustTxStep {
    poolAddress: Address;
    amountOut: string;
}

/**
[
    [
        {
            "pool": {
                "address": "EQCUhnOllvxtLDEj3_9k0yMeTQ4Wv6rFBtXr2wnzKzucZeER",
                "isStable": false,
                "assets": [
                    "native",
                    "jetton:0:2f956143c461769579baef2e32cc2d7bc18283f40d20bb03e432cd603ac33ffc"
                ],
                "reserves": ["33749455557299", "25579879280265794"]
            },
            "assetIn": "jetton:0:2f956143c461769579baef2e32cc2d7bc18283f40d20bb03e432cd603ac33ffc",
            "assetOut": "native",
            "tradeFee": "2500000",
            "amountIn": "1000000000",
            "amountOut": "1316076"
        },
        {
            "pool": {
                "address": "EQAZrva4n6ZBxryEuDcp062flYrWdxEXn7mEX2kNjqwrBdG8",
                "isStable": false,
                "assets": [
                    "native",
                    "jetton:0:716d0cad2fae30b93cf9d4a72938b7530d23a1aab5752da3ca0eb84ea8b077bf"
                ],
                "reserves": ["565807261", "9956583791"]
            },
            "assetIn": "native",
            "assetOut": "jetton:0:716d0cad2fae30b93cf9d4a72938b7530d23a1aab5752da3ca0eb84ea8b077bf",
            "tradeFee": "3290",
            "amountIn": "1316076",
            "amountOut": "23047790"
        }
    ]
]
 */
