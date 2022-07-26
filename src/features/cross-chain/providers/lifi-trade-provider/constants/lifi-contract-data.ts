import {
    LifiCrossChainSupportedBlockchain,
    lifiCrossChainSupportedBlockchains
} from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-cross-chain-supported-blockchain';
import { UniversalContract } from 'src/features/cross-chain/providers/common/models/universal-contract';

export const lifiContractAddress: Record<LifiCrossChainSupportedBlockchain, UniversalContract> =
    lifiCrossChainSupportedBlockchains.reduce((acc, blockchain) => {
        return {
            ...acc,
            [blockchain]: {
                providerRouter: '0x362fa9d0bca5d19f743db50738345ce2b40ec99f',
                providerGateway: '0x362fa9d0bca5d19f743db50738345ce2b40ec99f',
                rubicRouter: '0x3332241a5a4eCb4c28239A9731ad45De7f000333'
            }
        };
    }, {} as Record<LifiCrossChainSupportedBlockchain, UniversalContract>);
