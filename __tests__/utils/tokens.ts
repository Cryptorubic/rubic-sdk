import { NATIVE_TOKEN_ADDRESS } from '@core/blockchain/constants/native-token-address';
import { BLOCKCHAIN_NAME } from 'src/core';
import { Token } from 'src/core/blockchain/tokens/token';

export const TOKENS: Record<string, Token> = {
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
    })
};
