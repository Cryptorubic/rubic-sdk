import {
    MultichainProxyCrossChainSupportedBlockchain,
    multichainProxyCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/models/supported-blockchain';

export const multichainProxyContractAddress: Record<
    MultichainProxyCrossChainSupportedBlockchain,
    string
> = multichainProxyCrossChainSupportedBlockchains.reduce((acc, blockchain) => {
    let address;

    switch (blockchain) {
        case 'METIS':
            address = '0x333BE852042F435431967664e09315CC63593333';
            break;
        case 'OASIS':
            address = '0x333BE852042F435431967664e09315CC63593333';
            break;
        default:
            address = '0x333b8881485fB8dE9af05d0B259a7f3f032B3333';
    }

    return {
        ...acc,
        [blockchain]: address
    };
}, {} as Record<MultichainProxyCrossChainSupportedBlockchain, string>);
