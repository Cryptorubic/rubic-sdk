import { BLOCKCHAIN_NAME, BlockchainName } from '@rsdk-core/blockchain/models/blockchain-name';
import { TokenStruct } from 'src/common/tokens-manager/tokens/token';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import { BitcoinWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/bitcoin-web3-pure';

export type NativeTokensList = Record<BlockchainName, Omit<TokenStruct, 'blockchain'>>;

export const nativeTokensList: NativeTokensList = {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Binance Coin',
        symbol: 'BNB',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Matic Network',
        symbol: 'MATIC',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'AVAX',
        symbol: 'AVAX',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.MOONRIVER]: {
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'MOVR',
        symbol: 'MOVR',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.FANTOM]: {
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'FTM',
        symbol: 'FTM',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.HARMONY]: {
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'ONE',
        symbol: 'ONE',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.ARBITRUM]: {
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'AETH',
        symbol: 'AETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.AURORA]: {
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'aETH',
        symbol: 'aETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.TELOS]: {
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'TLOS',
        symbol: 'TLOS',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.SOLANA]: {
        address: '@TODO SOLANA',
        name: 'Solana',
        symbol: 'SOL',
        decimals: 24
    },
    [BLOCKCHAIN_NAME.NEAR]: {
        address: '@TODO NEAR',
        name: 'NEAR',
        symbol: 'NEAR',
        decimals: 24
    },
    [BLOCKCHAIN_NAME.OPTIMISM]: {
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.CRONOS]: {
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'CRO',
        symbol: 'CRO',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.OKE_X_CHAIN]: {
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'OKT',
        symbol: 'OKT',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.GNOSIS]: {
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'xDAI',
        symbol: 'xDAI',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.FUSE]: {
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'FUSE',
        symbol: 'FUSE',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.MOONBEAM]: {
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'GLMR',
        symbol: 'GLMR',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.CELO]: {
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'CELO',
        symbol: 'CELO',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.BOBA]: {
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.BITCOIN]: {
        address: BitcoinWeb3Pure.nativeTokenAddress,
        name: 'Bitcoin',
        symbol: 'BTC',
        decimals: 8
    }
};
