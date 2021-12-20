import { NATIVE_TOKEN_ADDRESS } from '@core/blockchain/constants/native-token-address';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { TokenStruct } from '@core/blockchain/tokens/token';

export type NativeTokensList = Record<BLOCKCHAIN_NAME, Omit<TokenStruct, 'blockchain'>>;

export const nativeTokensList: NativeTokensList = {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        address: NATIVE_TOKEN_ADDRESS,
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        address: NATIVE_TOKEN_ADDRESS,
        name: 'Binance Coin',
        symbol: 'BNB',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
        address: NATIVE_TOKEN_ADDRESS,
        name: 'Matic Network',
        symbol: 'MATIC',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        address: NATIVE_TOKEN_ADDRESS,
        name: 'AVAX',
        symbol: 'AVAX',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.MOONRIVER]: {
        address: NATIVE_TOKEN_ADDRESS,
        name: 'MOVR',
        symbol: 'MOVR',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.HARMONY]: {
        address: NATIVE_TOKEN_ADDRESS,
        name: 'ONE',
        symbol: 'ONE',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.FANTOM]: {
        address: NATIVE_TOKEN_ADDRESS,
        name: 'FTM',
        symbol: 'FTM',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.KOVAN]: {
        address: NATIVE_TOKEN_ADDRESS,
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET]: {
        address: NATIVE_TOKEN_ADDRESS,
        name: 'Binance Coin',
        symbol: 'BNB',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.POLYGON_TESTNET]: {
        address: NATIVE_TOKEN_ADDRESS,
        name: 'Matic Network',
        symbol: 'MATIC',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.AVALANCHE_TESTNET]: {
        address: NATIVE_TOKEN_ADDRESS,
        name: 'AVAX',
        symbol: 'AVAX',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.MOONRIVER_TESTNET]: {
        address: NATIVE_TOKEN_ADDRESS,
        name: 'MOVR',
        symbol: 'MOVR',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.HARMONY_TESTNET]: {
        address: NATIVE_TOKEN_ADDRESS,
        name: 'ONE',
        symbol: 'ONE',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.FANTOM_TESTNET]: {
        address: NATIVE_TOKEN_ADDRESS,
        name: 'FTM',
        symbol: 'FTM',
        decimals: 18
    }
};
