import { BLOCKCHAIN_NAME } from 'src/core';
import { DeBridgeCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/debridge-trade-provider/constants/debridge-cross-chain-supported-blockchain';

export const DE_BRIDGE_CONTRACT_ADDRESS: Record<DeBridgeCrossChainSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0x93f56C28b66Fa3EEF980ab11a8a0E9D09c6576f5',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x93f56C28b66Fa3EEF980ab11a8a0E9D09c6576f5',
    [BLOCKCHAIN_NAME.POLYGON]: '0x93f56C28b66Fa3EEF980ab11a8a0E9D09c6576f5',
    [BLOCKCHAIN_NAME.AVALANCHE]: '0x93f56C28b66Fa3EEF980ab11a8a0E9D09c6576f5',
    [BLOCKCHAIN_NAME.ARBITRUM]: '0x93f56C28b66Fa3EEF980ab11a8a0E9D09c6576f5'
};
