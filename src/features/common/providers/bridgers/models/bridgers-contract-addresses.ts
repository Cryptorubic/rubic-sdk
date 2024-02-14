import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { BridgersCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/constants/bridgers-cross-chain-supported-blockchain';

export const bridgersContractAddresses: Record<BridgersCrossChainSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0x92e929d8b2c8430bcaf4cd87654789578bb2b786',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x1ed5685f345b2fa564ea4a670de1fde39e484751',
    [BLOCKCHAIN_NAME.POLYGON]: '0x242Ea2A8C4a3377A738ed8a0d8cC0Fe8B4D6C36E',
    [BLOCKCHAIN_NAME.FANTOM]: '0x8f957ed3f969d7b6e5d6df81e61a5ff45f594dd1',
    [BLOCKCHAIN_NAME.TRON]: 'TEorZTZ5MHx8SrvsYs1R3Ds5WvY1pVoMSA'
};
