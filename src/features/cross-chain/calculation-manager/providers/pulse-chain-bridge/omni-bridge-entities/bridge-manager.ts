import { Token } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { PulseChainCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/constants/pulse-chain-supported-blockchains';
import { ForeignBridge } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/omni-bridge-entities/foreign-bridge';
import { HomeBridge } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/omni-bridge-entities/home-bridge';

export class BridgeManager {
    public static createBridge(
        fromToken: Token<PulseChainCrossChainSupportedBlockchain>,
        toToken: Token<PulseChainCrossChainSupportedBlockchain>
    ) {
        return fromToken.blockchain === BLOCKCHAIN_NAME.ETHEREUM
            ? new ForeignBridge(fromToken, toToken)
            : new HomeBridge(fromToken, toToken);
    }
}
