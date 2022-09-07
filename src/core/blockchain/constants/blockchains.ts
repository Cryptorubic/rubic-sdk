import { Blockchain } from '@rsdk-core/blockchain/models/blockchain';
import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';
import { Token } from 'src/common';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import { BitcoinWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/bitcoin-web3-pure';

export const blockchains: ReadonlyArray<Blockchain> = [
    {
        id: 1,
        name: BLOCKCHAIN_NAME.ETHEREUM,
        nativeCoin: new Token({
            blockchain: BLOCKCHAIN_NAME.ETHEREUM,
            address: EvmWeb3Pure.nativeTokenAddress,
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
            address: EvmWeb3Pure.nativeTokenAddress,
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
            address: EvmWeb3Pure.nativeTokenAddress,
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
            address: EvmWeb3Pure.nativeTokenAddress,
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
            address: EvmWeb3Pure.nativeTokenAddress,
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
            address: EvmWeb3Pure.nativeTokenAddress,
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
            address: EvmWeb3Pure.nativeTokenAddress,
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
            address: EvmWeb3Pure.nativeTokenAddress,
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
            address: EvmWeb3Pure.nativeTokenAddress,
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
            address: EvmWeb3Pure.nativeTokenAddress,
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
            address: EvmWeb3Pure.nativeTokenAddress,
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
            address: EvmWeb3Pure.nativeTokenAddress,
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
            address: EvmWeb3Pure.nativeTokenAddress,
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
            address: EvmWeb3Pure.nativeTokenAddress,
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
            address: EvmWeb3Pure.nativeTokenAddress,
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
            address: EvmWeb3Pure.nativeTokenAddress,
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
            address: EvmWeb3Pure.nativeTokenAddress,
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
            address: EvmWeb3Pure.nativeTokenAddress,
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
            address: BitcoinWeb3Pure.nativeTokenAddress,
            name: 'Bitcoin',
            symbol: 'BTC',
            decimals: 8
        })
    }
];
