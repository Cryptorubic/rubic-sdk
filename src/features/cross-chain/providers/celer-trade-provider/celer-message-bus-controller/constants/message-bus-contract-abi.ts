import { AbiItem } from 'web3-utils';

export const messageBusContractAbi: AbiItem[] = [
    {
        inputs: [{ internalType: 'bytes', name: '_message', type: 'bytes' }],
        name: 'calcFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'feeBase',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    }
];
