import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { RangoSupportedBlockchain } from './rango-supported-blockchains';

export const rangoApiBlockchainNames: Record<RangoSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: 'ETH',
    [BLOCKCHAIN_NAME.POLYGON]: 'POLYGON',
    [BLOCKCHAIN_NAME.OPTIMISM]: 'OPTIMISM',
    [BLOCKCHAIN_NAME.ARBITRUM]: 'ARBITRUM',
    [BLOCKCHAIN_NAME.FANTOM]: 'FANTOM',
    [BLOCKCHAIN_NAME.AVALANCHE]: 'AVAX_CCHAIN',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'BSC',
    [BLOCKCHAIN_NAME.CRONOS]: 'CRONOS',
    [BLOCKCHAIN_NAME.MOONBEAM]: 'MOONBEAM',
    [BLOCKCHAIN_NAME.MOONRIVER]: 'MOONRIVER',
    [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: 'POLYGONZK',
    [BLOCKCHAIN_NAME.AURORA]: 'AURORA',
    [BLOCKCHAIN_NAME.GNOSIS]: 'GNOSIS',
    [BLOCKCHAIN_NAME.BOBA]: 'BOBA',
    [BLOCKCHAIN_NAME.BOBA_BSC]: 'BOBA_BNB',
    [BLOCKCHAIN_NAME.BOBA_AVALANCHE]: 'BOBA_AVALANCHE'
};

export type RangoBlockchainName = keyof typeof rangoApiBlockchainNames;
