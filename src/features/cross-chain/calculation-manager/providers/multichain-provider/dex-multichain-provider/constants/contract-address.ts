import {
    MultichainProxyCrossChainSupportedBlockchain,
    multichainProxyCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/models/supported-blockchain';

export const multichainProxyContractAddress: Record<
    MultichainProxyCrossChainSupportedBlockchain,
    string
> = multichainProxyCrossChainSupportedBlockchains.reduce((acc, blockchain) => {
    let address: string;

    switch (blockchain) {
        case 'KLAYTN':
            address = '0x333BE852042F435431967664e09315CC63593333';
            break;
        default:
            address = '0x333BE852042F435431967664e09315CC63593333';
            break;
    }
    return {
        ...acc,
        [blockchain]: address
    };
}, {} as Record<MultichainProxyCrossChainSupportedBlockchain, string>);
