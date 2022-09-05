import { NATIVE_TOKEN_ADDRESS } from '@rsdk-core/blockchain/constants/native-token-address';
import { Blockchain } from '@rsdk-core/blockchain/models/blockchain';
import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';
import { Token } from 'src/common';

export const blockchains: ReadonlyArray<Blockchain> = [
    {
        id: 1,
        name: BLOCKCHAIN_NAME.ETHEREUM,
        nativeCoin: new Token({
            blockchain: BLOCKCHAIN_NAME.ETHEREUM,
            address: NATIVE_TOKEN_ADDRESS,
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
        })
    },
    {
        id: 56,
        name: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        nativeCoin: new Token({
            blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
            address: NATIVE_TOKEN_ADDRESS,
            name: 'Binance Coin',
            symbol: 'BNB',
            decimals: 18
        })
    },
    {
        id: 137,
        name: BLOCKCHAIN_NAME.POLYGON,
        nativeCoin: new Token({
            blockchain: BLOCKCHAIN_NAME.POLYGON,
            address: NATIVE_TOKEN_ADDRESS,
            name: 'Matic Network',
            symbol: 'MATIC',
            decimals: 18
        })
    },
    {
        id: 43114,
        name: BLOCKCHAIN_NAME.AVALANCHE,
        nativeCoin: new Token({
            blockchain: BLOCKCHAIN_NAME.AVALANCHE,
            address: NATIVE_TOKEN_ADDRESS,
            name: 'AVAX',
            symbol: 'AVAX',
            decimals: 18
        })
    },
    {
        id: 1285,
        name: BLOCKCHAIN_NAME.MOONRIVER,
        nativeCoin: new Token({
            blockchain: BLOCKCHAIN_NAME.MOONRIVER,
            address: NATIVE_TOKEN_ADDRESS,
            name: 'MOVR',
            symbol: 'MOVR',
            decimals: 18
        })
    },
    {
        id: 250,
        name: BLOCKCHAIN_NAME.FANTOM,
        nativeCoin: new Token({
            blockchain: BLOCKCHAIN_NAME.FANTOM,
            address: NATIVE_TOKEN_ADDRESS,
            name: 'Fantom',
            symbol: 'FTM',
            decimals: 18
        })
    },
    {
        id: 1666600000,
        name: BLOCKCHAIN_NAME.HARMONY,
        nativeCoin: new Token({
            blockchain: BLOCKCHAIN_NAME.HARMONY,
            address: NATIVE_TOKEN_ADDRESS,
            name: 'ONE',
            symbol: 'ONE',
            decimals: 18
        })
    },
    {
        id: 42161,
        name: BLOCKCHAIN_NAME.ARBITRUM,
        nativeCoin: new Token({
            blockchain: BLOCKCHAIN_NAME.ARBITRUM,
            address: NATIVE_TOKEN_ADDRESS,
            name: 'AETH',
            symbol: 'AETH',
            decimals: 18
        })
    },
    {
        id: 1313161554,
        name: BLOCKCHAIN_NAME.AURORA,
        nativeCoin: new Token({
            blockchain: BLOCKCHAIN_NAME.AURORA,
            address: NATIVE_TOKEN_ADDRESS,
            name: 'aETH',
            symbol: 'aETH',
            decimals: 18
        })
    },
    {
        id: 40,
        name: BLOCKCHAIN_NAME.TELOS,
        nativeCoin: new Token({
            blockchain: BLOCKCHAIN_NAME.TELOS,
            address: NATIVE_TOKEN_ADDRESS,
            name: 'Telos EVM',
            symbol: 'TLOS',
            decimals: 18
        })
    },
    {
        id: 10,
        name: BLOCKCHAIN_NAME.OPTIMISM,
        nativeCoin: new Token({
            blockchain: BLOCKCHAIN_NAME.OPTIMISM,
            address: NATIVE_TOKEN_ADDRESS,
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
        })
    },
    {
        id: 25,
        name: BLOCKCHAIN_NAME.CRONOS,
        nativeCoin: new Token({
            blockchain: BLOCKCHAIN_NAME.CRONOS,
            address: NATIVE_TOKEN_ADDRESS,
            name: 'CRO',
            symbol: 'CRO',
            decimals: 18
        })
    },
    {
        id: 66,
        name: BLOCKCHAIN_NAME.OKE_X_CHAIN,
        nativeCoin: new Token({
            blockchain: BLOCKCHAIN_NAME.OKE_X_CHAIN,
            address: NATIVE_TOKEN_ADDRESS,
            name: 'OKT',
            symbol: 'OKT',
            decimals: 18
        })
    },
    {
        id: 100,
        name: BLOCKCHAIN_NAME.GNOSIS,
        nativeCoin: new Token({
            blockchain: BLOCKCHAIN_NAME.GNOSIS,
            address: NATIVE_TOKEN_ADDRESS,
            name: 'xDAI',
            symbol: 'xDAI',
            decimals: 18
        })
    },
    {
        id: 122,
        name: BLOCKCHAIN_NAME.FUSE,
        nativeCoin: new Token({
            blockchain: BLOCKCHAIN_NAME.FUSE,
            address: NATIVE_TOKEN_ADDRESS,
            name: 'FUSE',
            symbol: 'FUSE',
            decimals: 18
        })
    },
    {
        id: 1284,
        name: BLOCKCHAIN_NAME.MOONBEAM,
        nativeCoin: new Token({
            blockchain: BLOCKCHAIN_NAME.MOONBEAM,
            address: NATIVE_TOKEN_ADDRESS,
            name: 'GLMR',
            symbol: 'GLMR',
            decimals: 18
        })
    },
    {
        id: 42220,
        name: BLOCKCHAIN_NAME.CELO,
        nativeCoin: new Token({
            blockchain: BLOCKCHAIN_NAME.CELO,
            address: NATIVE_TOKEN_ADDRESS,
            name: 'CELO',
            symbol: 'CELO',
            decimals: 18
        })
    },
    {
        id: 288,
        name: BLOCKCHAIN_NAME.BOBA,
        nativeCoin: new Token({
            blockchain: BLOCKCHAIN_NAME.BOBA,
            address: NATIVE_TOKEN_ADDRESS,
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
        })
    },
    {
        id: 5555,
        name: BLOCKCHAIN_NAME.BITCOIN,
        nativeCoin: new Token({
            blockchain: BLOCKCHAIN_NAME.BITCOIN,
            address: '',
            name: 'Bitcoin',
            symbol: 'BTC',
            decimals: 8
        })
    }
];
