import { commonCrossChainAbi } from 'src/features/cross-chain/providers/common/constants/common-cross-chain-abi';

export const viaContractAddress = '0x3332241a5a4eCb4c28239A9731ad45De7f000333';

export const viaContractAbi = commonCrossChainAbi.concat({
    inputs: [],
    name: 'getAvailableRouters',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function'
});
