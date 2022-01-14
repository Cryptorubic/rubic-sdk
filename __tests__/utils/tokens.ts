import { NATIVE_TOKEN_ADDRESS } from '@core/blockchain/constants/native-token-address';
import { BLOCKCHAIN_NAME } from 'src/core';
import { Token } from 'src/core/blockchain/tokens/token';

export const TOKENS = {
    ETH: new Token({
        blockchain: BLOCKCHAIN_NAME.ETHEREUM,
        address: NATIVE_TOKEN_ADDRESS,
        decimals: 18,
        symbol: 'ETH',
        name: 'Ethereum'
    }),
    USDT: new Token({
        blockchain: BLOCKCHAIN_NAME.ETHEREUM,
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        decimals: 6,
        symbol: 'USDT',
        name: 'Tether USD'
    }),
    RBC: new Token({
        blockchain: BLOCKCHAIN_NAME.ETHEREUM,
        address: '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3',
        decimals: 18,
        symbol: 'RBC',
        name: 'Rubic'
    }),
    WETH: new Token({
        blockchain: BLOCKCHAIN_NAME.ETHEREUM,
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        decimals: 18,
        symbol: 'WETH',
        name: 'Wrapped Ether'
    }),
    DAI: new Token({
        blockchain: BLOCKCHAIN_NAME.ETHEREUM,
        address: '0x6b175474e89094c44da98b954eedeac495271d0f',
        decimals: 18,
        symbol: 'DAI',
        name: 'Dai Stablecoin'
    }),
    WBTC: new Token({
        blockchain: BLOCKCHAIN_NAME.ETHEREUM,
        address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        decimals: 8,
        symbol: 'WBTC',
        name: 'Wrapped BTC'
    })
} as const;

export const TOKENS_HOLDERS: Partial<Record<BLOCKCHAIN_NAME, Record<string, string>>> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3': '0x0541f3300307984984a587aeb7c34139e19124fa', // RBC
        '0xdac17f958d2ee523a2206206994597c13d831ec7': '0x5754284f345afc66a98fbb0a0afe71e0f007b949' // USDT
    }
};
