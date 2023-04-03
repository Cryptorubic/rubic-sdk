import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import {
    ViaCrossChainSupportedBlockchain,
    viaCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/via-provider/constants/via-cross-chain-supported-blockchain';

export const viaContractAddress: Record<ViaCrossChainSupportedBlockchain, string> =
    viaCrossChainSupportedBlockchains.reduce((acc, blockchain) => {
        return {
            ...acc,
            [blockchain]: rubicProxyContractAddress[blockchain].router
        };
    }, {} as Record<ViaCrossChainSupportedBlockchain, string>);
