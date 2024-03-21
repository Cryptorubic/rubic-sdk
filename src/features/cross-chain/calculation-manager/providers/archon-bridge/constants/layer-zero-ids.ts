import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { ArchonBridgeSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/constants/archon-bridge-supported-blockchain';

export const layerZeroIds: Record<ArchonBridgeSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.HORIZEN_EON]: '215',
    [BLOCKCHAIN_NAME.ETHEREUM]: '101',
    [BLOCKCHAIN_NAME.AVALANCHE]: '106'
};
