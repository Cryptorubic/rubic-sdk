import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniversalContract } from 'src/features/cross-chain/calculation-manager/providers/common/models/universal-contract';
import { ScrollBridgeSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/scroll-bridge/models/scroll-bridge-supported-blockchain';

export const scrollBridgeContractAddress: Record<
    ScrollBridgeSupportedBlockchain,
    UniversalContract
> = {
    [BLOCKCHAIN_NAME.SCROLL_SEPOLIA]: {
        providerGateway: '0xaDcA915971A336EA2f5b567e662F5bd74AEf9582',
        providerRouter: '0xaDcA915971A336EA2f5b567e662F5bd74AEf9582',
        rubicRouter: '0x33798753ec66aEc00ed7E337B41F444f53A63333'
    },
    [BLOCKCHAIN_NAME.GOERLI]: {
        providerGateway: '0xe5E30E7c24e4dFcb281A682562E53154C15D3332',
        providerRouter: '0xe5E30E7c24e4dFcb281A682562E53154C15D3332',
        rubicRouter: '0x33798753ec66aEc00ed7E337B41F444f53A63333'
    }
};
