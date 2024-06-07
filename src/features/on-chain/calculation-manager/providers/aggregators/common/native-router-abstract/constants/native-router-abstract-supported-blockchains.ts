import { NativeRouterChain } from '../models/native-router-transaction-request';

export const nativeRouterAbstractSupportedBlockchains: NativeRouterChain[] = [
    {
        chainId: 56,
        chain: 'bsc',
        label: 'Binance',
        token: 'BNB',
        isMainnet: true
    },
    {
        chainId: 1,
        chain: 'ethereum',
        label: 'Ethereum',
        token: 'ETH',
        isMainnet: true
    },
    {
        chainId: 137,
        chain: 'polygon',
        label: 'Polygon',
        token: 'MATIC',
        isMainnet: true
    },
    {
        chainId: 42161,
        chain: 'arbitrum',
        label: 'Arbitrum',
        token: 'ETH',
        isMainnet: true
    },
    {
        chainId: 43114,
        chain: 'avalanche',
        label: 'Avalanche',
        token: 'AVAX',
        isMainnet: true
    },
    {
        chainId: 5000,
        chain: 'mantle',
        label: 'Mantle',
        token: 'MNT',
        isMainnet: true
    },
    {
        chainId: 8453,
        chain: 'base',
        label: 'Base',
        token: 'ETH',
        isMainnet: true
    },
    {
        chainId: 534352,
        chain: 'scroll',
        label: 'Scroll',
        token: 'ETH',
        isMainnet: true
    },
    {
        chainId: 169,
        chain: 'manta',
        label: 'Manta',
        token: 'ETH',
        isMainnet: true
    },
    {
        chainId: 7000,
        chain: 'zetachain',
        label: 'Zetachain Mainnet',
        token: 'ZETA',
        isMainnet: true
    },
    {
        chainId: 59144,
        chain: 'linea',
        label: 'Linea',
        token: 'ETH',
        isMainnet: true
    },
    {
        chainId: 810180,
        chain: 'zklink',
        label: 'ZkLink',
        token: 'ETH',
        isMainnet: true
    }
];
