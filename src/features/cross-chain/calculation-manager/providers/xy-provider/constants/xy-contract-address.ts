import {
    XyCrossChainSupportedBlockchain,
    xySupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/xy-provider/constants/xy-supported-blockchains';

import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { UniversalContract } from 'src/features/cross-chain/calculation-manager/providers/common/models/universal-contract';

const defaultContracts = {
    providerRouter: '0x935BbF5c69225E3EDa7C3aA542A7Baa5c5c30094',
    providerGateway: '0x935BbF5c69225E3EDa7C3aA542A7Baa5c5c30094'
};

export const XyContractAddress: Record<XyCrossChainSupportedBlockchain, UniversalContract> =
    xySupportedBlockchains.reduce((acc, blockchain) => {
        return {
            ...acc,
            [blockchain]: {
                ...defaultContracts,
                rubicRouter: rubicProxyContractAddress[blockchain]
            }
        };
    }, {} as Record<XyCrossChainSupportedBlockchain, UniversalContract>);
