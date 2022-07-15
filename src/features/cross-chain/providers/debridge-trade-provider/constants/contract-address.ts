import { BLOCKCHAIN_NAME } from 'src/core';
import { DeBridgeCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/debridge-trade-provider/constants/debridge-cross-chain-supported-blockchain';

export const DE_BRIDGE_CONTRACT_ADDRESS: Record<DeBridgeCrossChainSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0x2CF985a54a3fe6c2DfaBe2f58a9Aae8cEbc8dfd3',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xb1f691286fF2C0B3cA917D9cDe8C866C43CB5Eb8',
    [BLOCKCHAIN_NAME.POLYGON]: '0x5Cc8F95d64d929B456ea0831e42280AF85481876',
    [BLOCKCHAIN_NAME.AVALANCHE]: '0x454C144700B2f3348D204805A484130cD31F7002',
    [BLOCKCHAIN_NAME.ARBITRUM]: '0x0'
};
