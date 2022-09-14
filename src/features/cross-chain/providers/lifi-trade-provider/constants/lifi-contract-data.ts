import {
    LifiCrossChainSupportedBlockchain,
    lifiCrossChainSupportedBlockchains
} from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-cross-chain-supported-blockchain';
import { UniversalContract } from 'src/features/cross-chain/providers/common/models/universal-contract';
import { rubicProxyContractAddress } from 'src/features/cross-chain/providers/common/constants/rubic-proxy-contract-address';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const lifiContractAddress: Record<LifiCrossChainSupportedBlockchain, UniversalContract> =
    lifiCrossChainSupportedBlockchains.reduce((acc, blockchain) => {
        let routerAddress = '0x362fa9d0bca5d19f743db50738345ce2b40ec99f';
        if (blockchain === BLOCKCHAIN_NAME.CRONOS) {
            routerAddress = '0x634398cb81b76bfc75ebb434cf7c82036f9e7d78';
        }
        return {
            ...acc,
            [blockchain]: {
                providerRouter: routerAddress,
                providerGateway: routerAddress,
                rubicRouter: rubicProxyContractAddress[blockchain]
            }
        };
    }, {} as Record<LifiCrossChainSupportedBlockchain, UniversalContract>);
