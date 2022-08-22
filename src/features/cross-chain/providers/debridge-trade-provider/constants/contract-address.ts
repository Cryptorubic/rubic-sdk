import { BLOCKCHAIN_NAME } from 'src/core';
import { DeBridgeCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/debridge-trade-provider/constants/debridge-cross-chain-supported-blockchain';
import { UniversalContract } from 'src/features/cross-chain/providers/common/models/universal-contract';

const defaultContracts = {
    providerRouter: '0x663DC15D3C1aC63ff12E45Ab68FeA3F0a883C251',
    providerGateway: '0x663DC15D3C1aC63ff12E45Ab68FeA3F0a883C251',
    rubicRouter: '0x3332241a5a4eCb4c28239A9731ad45De7f000333'
};

export const DE_BRIDGE_CONTRACT_ADDRESS: Record<
    DeBridgeCrossChainSupportedBlockchain,
    UniversalContract
> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: defaultContracts,
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: defaultContracts,
    [BLOCKCHAIN_NAME.POLYGON]: defaultContracts,
    [BLOCKCHAIN_NAME.AVALANCHE]: defaultContracts,
    [BLOCKCHAIN_NAME.ARBITRUM]: defaultContracts
};
