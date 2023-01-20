import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { RangoCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/constants/rango-cross-chain-supported-blockchain';

export const RANGO_BLOCKCHAIN_NAME: Record<RangoCrossChainSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: 'ETH',
    [BLOCKCHAIN_NAME.AVALANCHE]: 'AVAX_CCHAIN',
    [BLOCKCHAIN_NAME.POLYGON]: 'POLYGON',
    [BLOCKCHAIN_NAME.OPTIMISM]: 'OPTIMISM',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'BSC',
    [BLOCKCHAIN_NAME.FANTOM]: 'FANTOM',
    [BLOCKCHAIN_NAME.ARBITRUM]: 'ARBITRUM'
};
