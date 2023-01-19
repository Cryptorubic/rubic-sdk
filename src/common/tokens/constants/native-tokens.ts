import { Token } from 'src/common/tokens/token';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { BitcoinWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/bitcoin-web3-pure';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/tron-web3-pure';

export const nativeTokensList = {
    [BLOCKCHAIN_NAME.ETHEREUM]: new Token({
        blockchain: BLOCKCHAIN_NAME.ETHEREUM,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: new Token({
        blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Binance Coin',
        symbol: 'BNB',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.POLYGON]: new Token({
        blockchain: BLOCKCHAIN_NAME.POLYGON,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Matic Network',
        symbol: 'MATIC',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.AVALANCHE]: new Token({
        blockchain: BLOCKCHAIN_NAME.AVALANCHE,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'AVAX',
        symbol: 'AVAX',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.MOONRIVER]: new Token({
        blockchain: BLOCKCHAIN_NAME.MOONRIVER,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'MOVR',
        symbol: 'MOVR',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.FANTOM]: new Token({
        blockchain: BLOCKCHAIN_NAME.FANTOM,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'FTM',
        symbol: 'FTM',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.HARMONY]: new Token({
        blockchain: BLOCKCHAIN_NAME.HARMONY,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'ONE',
        symbol: 'ONE',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.ARBITRUM]: new Token({
        blockchain: BLOCKCHAIN_NAME.ARBITRUM,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'AETH',
        symbol: 'AETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.AURORA]: new Token({
        blockchain: BLOCKCHAIN_NAME.AURORA,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'aETH',
        symbol: 'aETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.TELOS]: new Token({
        blockchain: BLOCKCHAIN_NAME.TELOS,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'TLOS',
        symbol: 'TLOS',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.SOLANA]: new Token({
        blockchain: BLOCKCHAIN_NAME.SOLANA,
        address: '@TODO SOLANA',
        name: 'Solana',
        symbol: 'SOL',
        decimals: 24
    }),
    [BLOCKCHAIN_NAME.NEAR]: new Token({
        blockchain: BLOCKCHAIN_NAME.NEAR,
        address: '@TODO NEAR',
        name: 'NEAR',
        symbol: 'NEAR',
        decimals: 24
    }),
    [BLOCKCHAIN_NAME.OPTIMISM]: new Token({
        blockchain: BLOCKCHAIN_NAME.OPTIMISM,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.CRONOS]: new Token({
        blockchain: BLOCKCHAIN_NAME.CRONOS,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'CRO',
        symbol: 'CRO',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.OKE_X_CHAIN]: new Token({
        blockchain: BLOCKCHAIN_NAME.OKE_X_CHAIN,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'OKT',
        symbol: 'OKT',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.GNOSIS]: new Token({
        blockchain: BLOCKCHAIN_NAME.GNOSIS,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'xDAI',
        symbol: 'xDAI',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.FUSE]: new Token({
        blockchain: BLOCKCHAIN_NAME.FUSE,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'FUSE',
        symbol: 'FUSE',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.MOONBEAM]: new Token({
        blockchain: BLOCKCHAIN_NAME.MOONBEAM,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'GLMR',
        symbol: 'GLMR',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.CELO]: new Token({
        blockchain: BLOCKCHAIN_NAME.CELO,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'CELO',
        symbol: 'CELO',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.BOBA]: new Token({
        blockchain: BLOCKCHAIN_NAME.BOBA,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'BOBA',
        symbol: 'BOBA',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.BOBA_BSC]: new Token({
        blockchain: BLOCKCHAIN_NAME.BOBA_BSC,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'BOBA',
        symbol: 'BOBA',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.BOBA_AVALANCHE]: new Token({
        blockchain: BLOCKCHAIN_NAME.BOBA_AVALANCHE,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'BOBA',
        symbol: 'BOBA',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.ASTAR]: new Token({
        blockchain: BLOCKCHAIN_NAME.ASTAR,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'ASTR',
        symbol: 'ASTR',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.ETHEREUM_POW]: new Token({
        blockchain: BLOCKCHAIN_NAME.ETHEREUM_POW,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Ethereum PoW',
        symbol: 'ETHW',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.KAVA]: new Token({
        blockchain: BLOCKCHAIN_NAME.KAVA,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'KAVA',
        symbol: 'KAVA',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.BITCOIN]: new Token({
        blockchain: BLOCKCHAIN_NAME.BITCOIN,
        address: BitcoinWeb3Pure.nativeTokenAddress,
        name: 'Bitcoin',
        symbol: 'BTC',
        decimals: 8
    }),
    [BLOCKCHAIN_NAME.TRON]: new Token({
        blockchain: BLOCKCHAIN_NAME.TRON,
        address: TronWeb3Pure.nativeTokenAddress,
        name: 'TRX',
        symbol: 'TRX',
        decimals: 6
    }),
    [BLOCKCHAIN_NAME.BITGERT]: new Token({
        blockchain: BLOCKCHAIN_NAME.BITGERT,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Brise',
        symbol: 'BRISE',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.OASIS]: new Token({
        blockchain: BLOCKCHAIN_NAME.OASIS,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'ROSE',
        symbol: 'ROSE',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.METIS]: new Token({
        blockchain: BLOCKCHAIN_NAME.METIS,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Metis token',
        symbol: 'METIS',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.DFK]: new Token({
        blockchain: BLOCKCHAIN_NAME.DFK,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'JEWEL',
        symbol: 'JEWEL',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.KLAYTN]: new Token({
        blockchain: BLOCKCHAIN_NAME.KLAYTN,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Klaytn',
        symbol: 'KLAY',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.VELAS]: new Token({
        blockchain: BLOCKCHAIN_NAME.VELAS,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Velas',
        symbol: 'VLX',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.SYSCOIN]: new Token({
        blockchain: BLOCKCHAIN_NAME.SYSCOIN,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Syscoin',
        symbol: 'SYS',
        decimals: 18
    })
};
