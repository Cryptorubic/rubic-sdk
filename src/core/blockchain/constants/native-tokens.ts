import { NATIVE_TOKEN_ADDRESS } from '@core/blockchain/constants/native-token-address';
import { BLOCKCHAIN_NAME, BlockchainName } from '@core/blockchain/models/blockchain-name';
import { TokenStruct } from '@core/blockchain/tokens/token';

export type NativeTokensList = Record<BlockchainName, Omit<TokenStruct, 'blockchain'>>;

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
    [BLOCKCHAIN_NAME.FANTOM]: {
        address: NATIVE_TOKEN_ADDRESS,
        name: 'FTM',
        symbol: 'FTM',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.HARMONY]: {
        address: NATIVE_TOKEN_ADDRESS,
        name: 'ONE',
        symbol: 'ONE',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.ARBITRUM]: {
        address: NATIVE_TOKEN_ADDRESS,
        name: 'AETH',
        symbol: 'AETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.AURORA]: {
        address: NATIVE_TOKEN_ADDRESS,
        name: 'aETH',
        symbol: 'aETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.TELOS]: {
        address: NATIVE_TOKEN_ADDRESS,
        name: 'TLOS',
        symbol: 'TLOS',
        decimals: 24
    }
};
