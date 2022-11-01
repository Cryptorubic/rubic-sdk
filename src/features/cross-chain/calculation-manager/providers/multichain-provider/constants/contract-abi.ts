import { AbiItem } from 'web3-utils';

export const multichainContractAbi = [
    {
        inputs: [
            { internalType: 'address', name: 'token', type: 'address' },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
            { internalType: 'uint256', name: 'toChainID', type: 'uint256' }
        ],
        name: 'anySwapOut',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: 'token', type: 'address' },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'toChainID', type: 'uint256' }
        ],
        name: 'anySwapOutNative',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: 'token', type: 'address' },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
            { internalType: 'uint256', name: 'toChainID', type: 'uint256' }
        ],
        name: 'anySwapOutUnderlying',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    }
] as AbiItem[];
