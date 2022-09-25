import { BridgersCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/bridgers-trade-provider/constants/bridgers-cross-chain-supported-blockchain';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const toBridgersBlockchain: Record<BridgersCrossChainSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: 'ETH',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'BSC',
    [BLOCKCHAIN_NAME.POLYGON]: 'POLYGON',
    [BLOCKCHAIN_NAME.FANTOM]: 'FANTOM',
    [BLOCKCHAIN_NAME.TRON]: 'TRON'
};
