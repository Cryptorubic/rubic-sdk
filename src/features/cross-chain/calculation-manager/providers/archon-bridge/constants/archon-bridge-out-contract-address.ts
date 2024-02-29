import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { ArchonBridgeSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/constants/archon-bridge-supported-blockchain';
import { UniversalContract } from 'src/features/cross-chain/calculation-manager/providers/common/models/universal-contract';

export const archonBridgeOutContractAddress: Record<
    Exclude<ArchonBridgeSupportedBlockchain, typeof BLOCKCHAIN_NAME.HORIZEN_EON>,
    UniversalContract
> = {
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        providerGateway: '0x7A302432D99DE20bc622e9148b690f22ef21436e',
        providerRouter: '0x7A302432D99DE20bc622e9148b690f22ef21436e',
        rubicRouter: '0x33798753ec66aEc00ed7E337B41F444f53A63333'
    },
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        providerGateway: '0x4fd89120A6d34024Cb86a9a0d7819565Fe4eC351',
        providerRouter: '0x4fd89120A6d34024Cb86a9a0d7819565Fe4eC351',
        rubicRouter: '0x33798753ec66aEc00ed7E337B41F444f53A63333'
    }
};

export const archonBridgeInContractAddress: Record<
    Exclude<ArchonBridgeSupportedBlockchain, typeof BLOCKCHAIN_NAME.HORIZEN_EON>,
    UniversalContract
> = {
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        providerGateway: '0x0c81b1905125ED89C42a0aDa098adfd461f8A9C5',
        providerRouter: '0x0c81b1905125ED89C42a0aDa098adfd461f8A9C5',
        rubicRouter: '0x33798753ec66aEc00ed7E337B41F444f53A63333'
    },
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        providerGateway: '0x954367cb2028e704B62a4093f648BE453aCA3989',
        providerRouter: '0x954367cb2028e704B62a4093f648BE453aCA3989',
        rubicRouter: '0x33798753ec66aEc00ed7E337B41F444f53A63333'
    }
};
