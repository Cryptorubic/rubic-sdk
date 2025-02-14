import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { TeleSwapCcrSupportedChain } from './teleswap-ccr-supported-chains';

export const teleSwapNetworkTickers: Record<TeleSwapCcrSupportedChain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: 'ethereum',
    [BLOCKCHAIN_NAME.BASE]: 'base',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'bsc',
    [BLOCKCHAIN_NAME.ARBITRUM]: 'arbitrum',
    [BLOCKCHAIN_NAME.POLYGON]: 'polygon',
    [BLOCKCHAIN_NAME.OPTIMISM]: 'optimism',
    [BLOCKCHAIN_NAME.BITCOIN]: 'bitcoin'
};
