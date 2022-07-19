import { BLOCKCHAIN_NAME } from 'src/core';
import { DeBridgeCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/debridge-trade-provider/constants/debridge-cross-chain-supported-blockchain';

export const DE_BRIDGE_CONTRACT_ADDRESS: Record<DeBridgeCrossChainSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0x7A13448555b9AC7267826cb691D54cA07eb67C08',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x7A13448555b9AC7267826cb691D54cA07eb67C08',
    [BLOCKCHAIN_NAME.POLYGON]: '0x7A13448555b9AC7267826cb691D54cA07eb67C08',
    [BLOCKCHAIN_NAME.AVALANCHE]: '0x7A13448555b9AC7267826cb691D54cA07eb67C08',
    [BLOCKCHAIN_NAME.ARBITRUM]: '0x7A13448555b9AC7267826cb691D54cA07eb67C08'
};
