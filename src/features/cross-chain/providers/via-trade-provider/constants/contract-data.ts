import { commonCrossChainAbi } from 'src/features/cross-chain/providers/common/constants/common-cross-chain-abi';
import {
    ViaCrossChainSupportedBlockchain,
    viaCrossChainSupportedBlockchains
} from 'src/features/cross-chain/providers/via-trade-provider/constants/via-cross-chain-supported-blockchain';
import { rubicProxyContractAddress } from 'src/features/cross-chain/providers/common/constants/rubic-proxy-contract-address';

export const viaContractAddress: Record<ViaCrossChainSupportedBlockchain, string> =
    viaCrossChainSupportedBlockchains.reduce((acc, blockchain) => {
        return {
            ...acc,
            [blockchain]: rubicProxyContractAddress[blockchain]
        };
    }, {} as Record<ViaCrossChainSupportedBlockchain, string>);

export const viaContractAbi = commonCrossChainAbi.concat({
    inputs: [],
    name: 'getAvailableRouters',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function'
});
