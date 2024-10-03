import { AbiInput, AbiItem } from 'web3-utils';

export const acrossDepositAbi: AbiItem[] = [
    {
        inputs: [
            { internalType: 'address', name: 'depositor', type: 'address' },
            { internalType: 'address', name: 'recipient', type: 'address' },
            { internalType: 'address', name: 'inputToken', type: 'address' },
            { internalType: 'address', name: 'outputToken', type: 'address' },
            { internalType: 'uint256', name: 'inputAmount', type: 'uint256' },
            { internalType: 'uint256', name: 'outputAmount', type: 'uint256' },
            { internalType: 'uint256', name: 'destinationChainId', type: 'uint256' },
            { internalType: 'address', name: 'exclusiveRelayer', type: 'address' },
            { internalType: 'uint32', name: 'quoteTimestamp', type: 'uint32' },
            { internalType: 'uint32', name: 'fillDeadline', type: 'uint32' },
            { internalType: 'uint32', name: 'exclusivityDeadline', type: 'uint32' },
            { internalType: 'bytes', name: 'message', type: 'bytes' }
        ],
        outputs: [],
        name: 'depositV3',
        type: 'function',
        stateMutability: 'payable'
    }
];

export const acrossFundsDepositedInputs: AbiInput[] = [
    { indexed: true, internalType: 'uint256', name: 'destinationChainId', type: 'uint256' },
    { indexed: true, internalType: 'uint32', name: 'depositId', type: 'uint32' },
    { indexed: true, internalType: 'address', name: 'depositor', type: 'address' }
];
