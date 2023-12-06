import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { RangoSupportedBlockchain } from './rango-supported-blockchains';

export const rangoApiSymbols: Record<RangoSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: 'ETH',
    [BLOCKCHAIN_NAME.POLYGON]: 'MATIC',
    [BLOCKCHAIN_NAME.OPTIMISM]: 'ETH',
    [BLOCKCHAIN_NAME.ARBITRUM]: 'ETH',
    [BLOCKCHAIN_NAME.FANTOM]: 'FTM',
    [BLOCKCHAIN_NAME.AVALANCHE]: 'AVAX',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'BNB',
    [BLOCKCHAIN_NAME.CRONOS]: 'CRO',
    [BLOCKCHAIN_NAME.MOONBEAM]: 'GLMR',
    [BLOCKCHAIN_NAME.MOONRIVER]: 'MOVR',
    [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: 'POLYGONZK',
    [BLOCKCHAIN_NAME.AURORA]: 'ETH',
    [BLOCKCHAIN_NAME.GNOSIS]: 'XDAI',
    [BLOCKCHAIN_NAME.BOBA]: 'BOBA',
    [BLOCKCHAIN_NAME.BOBA_BSC]: 'BOBA',
    [BLOCKCHAIN_NAME.BOBA_AVALANCHE]: 'BOBA',
    [BLOCKCHAIN_NAME.STARKNET]: 'ETH'
};

export type RangoSymbols = keyof typeof rangoApiSymbols;
