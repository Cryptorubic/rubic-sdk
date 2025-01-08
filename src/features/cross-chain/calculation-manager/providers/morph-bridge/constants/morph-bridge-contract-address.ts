import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { MorphBridgeSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/morph-bridge/models/morph-bridge-supported-blockchain';

export const morphBridgeContractAddress: Record<MorphBridgeSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0x7497756ada7e656ae9f00781af49fc0fd08f8a8a',
    [BLOCKCHAIN_NAME.MORPH]: '0x5300000000000000000000000000000000000002'
};
