import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { ArbitrumRbcBridgeSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/arbitrum-rbc-bridge/constants/arbitrum-rbc-bridge-supported-blockchain';
import { UniversalContract } from 'src/features/cross-chain/calculation-manager/providers/common/models/universal-contract';

export const arbitrumRbcBridgeContractAddress: Record<
    ArbitrumRbcBridgeSupportedBlockchain,
    UniversalContract
> = {
    [BLOCKCHAIN_NAME.ARBITRUM]: {
        providerGateway: '0x09e9222E96E7B4AE2a407B98d48e330053351EEe',
        providerRouter: '0x5288c571Fd7aD117beA99bF60FE0846C4E84F933',
        rubicRouter: '0x33798753ec66aEc00ed7E337B41F444f53A63333'
    },
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        providerGateway: '0xa3A7B6F88361F48403514059F1F16C8E78d60EeC',
        providerRouter: '0x72Ce9c846789fdB6fC1f34aC4AD25Dd9ef7031ef',
        rubicRouter: '0x33798753ec66aEc00ed7E337B41F444f53A63333'
    }
};
