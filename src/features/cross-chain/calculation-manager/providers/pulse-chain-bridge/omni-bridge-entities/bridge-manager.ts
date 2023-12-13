import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { ForeignBridge } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/omni-bridge-entities/foreign-bridge';
import { HomeBridge } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/omni-bridge-entities/home-bridge';

export class BridgeManager {
    public static createBridge(sourceChain: BlockchainName) {
        return sourceChain === BLOCKCHAIN_NAME.ETHEREUM
            ? new ForeignBridge(BLOCKCHAIN_NAME.ETHEREUM, BLOCKCHAIN_NAME.PULSECHAIN)
            : new HomeBridge(BLOCKCHAIN_NAME.PULSECHAIN, BLOCKCHAIN_NAME.ETHEREUM);
    }
}
