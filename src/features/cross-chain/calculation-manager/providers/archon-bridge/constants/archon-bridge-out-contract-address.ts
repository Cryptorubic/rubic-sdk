import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { ArchonBridgeSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/constants/archon-bridge-supported-blockchain';

type EonContract = { wrapRouter: string; originRouter: string; rubicRouter: string };
export const archonBridgeOutContractAddress: Record<
    Exclude<ArchonBridgeSupportedBlockchain, typeof BLOCKCHAIN_NAME.HORIZEN_EON>,
    EonContract
> = {
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        wrapRouter: '0xA2C2214dD03a60404C5AdeF4514E77fC00668592',
        originRouter: '0x7A302432D99DE20bc622e9148b690f22ef21436e',
        rubicRouter: '0x33798753ec66aEc00ed7E337B41F444f53A63333'
    },
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        wrapRouter: '0xA2C2214dD03a60404C5AdeF4514E77fC00668592',
        originRouter: '0x4fd89120A6d34024Cb86a9a0d7819565Fe4eC351',
        rubicRouter: '0x33798753ec66aEc00ed7E337B41F444f53A63333'
    }
};

export const archonBridgeInContractAddress: Record<
    Exclude<ArchonBridgeSupportedBlockchain, typeof BLOCKCHAIN_NAME.HORIZEN_EON>,
    EonContract
> = {
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        wrapRouter: '0xB2F5d60530C5E589bd9326e4c57933F611a624C6',
        originRouter: '0x0c81b1905125ED89C42a0aDa098adfd461f8A9C5',
        rubicRouter: '0x33798753ec66aEc00ed7E337B41F444f53A63333'
    },
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        wrapRouter: '0x8dE1Fb1F8a23202C7282716AE0089c6a96e07995',
        originRouter: '0x954367cb2028e704B62a4093f648BE453aCA3989',
        rubicRouter: '0x33798753ec66aEc00ed7E337B41F444f53A63333'
    }
};
