import {
    MultichainProxyCrossChainSupportedBlockchain,
    multichainProxyCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/models/supported-blockchain';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const multichainProxyContractAddress: Record<
    MultichainProxyCrossChainSupportedBlockchain,
    string
> = multichainProxyCrossChainSupportedBlockchains.reduce((acc, blockchain) => {
    let routerAddress = '0x333b8881485fB8dE9af05d0B259a7f3f032B3333';
    if (blockchain === BLOCKCHAIN_NAME.KAVA) {
        routerAddress = '0x451EA65b89F9D99011D643d99785F8Ede936f08E';
    }
    return {
        ...acc,
        [blockchain]: routerAddress
    };
}, {} as Record<MultichainProxyCrossChainSupportedBlockchain, string>);
