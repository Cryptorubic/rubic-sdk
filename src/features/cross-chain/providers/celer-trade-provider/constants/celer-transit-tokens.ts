import { CelerCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/celer-trade-provider/models/celer-cross-chain-supported-blockchain';
import { TokenStruct } from 'src/common/tokens/token';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const celerTransitTokens: Record<CelerCrossChainSupportedBlockchain, TokenStruct> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        blockchain: BLOCKCHAIN_NAME.ETHEREUM,
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        name: 'USDC',
        symbol: 'USDC',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
        blockchain: BLOCKCHAIN_NAME.POLYGON,
        address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6
    },
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        blockchain: BLOCKCHAIN_NAME.AVALANCHE,
        address: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
        name: 'USDC',
        symbol: 'USDC.e',
        decimals: 6
    },
    [BLOCKCHAIN_NAME.FANTOM]: {
        blockchain: BLOCKCHAIN_NAME.FANTOM,
        address: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6
    },
    [BLOCKCHAIN_NAME.ARBITRUM]: {
        blockchain: BLOCKCHAIN_NAME.ARBITRUM,
        address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6
    },
    [BLOCKCHAIN_NAME.AURORA]: {
        blockchain: BLOCKCHAIN_NAME.AURORA,
        address: '0xb12bfca5a55806aaf64e99521918a4bf0fc40802',
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6
    }
};
