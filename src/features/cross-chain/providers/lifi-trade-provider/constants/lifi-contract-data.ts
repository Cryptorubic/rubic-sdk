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
                rubicRouter: '0xc296428642cd8E05D67edB9018EAd8f5B5c981BC'
            }
        };
    }, {} as Record<LifiCrossChainSupportedBlockchain, UniversalContract>);
