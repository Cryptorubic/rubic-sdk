import { AbiItem } from 'web3-utils';

export const rubicRouterAbi: AbiItem[] = [
    {
        inputs: [
            { internalType: 'address', name: '_dex', type: 'address' },
            { internalType: 'address', name: '_tokenIn', type: 'address' },
            { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
            { internalType: 'address', name: '_tokenOut', type: 'address' },
            { internalType: 'bytes', name: '_data', type: 'bytes' }
        ],
        name: 'dexCall',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_dex', type: 'address' },
            { internalType: 'address', name: '_receiver', type: 'address' },
            { internalType: 'address', name: '_tokenIn', type: 'address' },
            { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
            { internalType: 'address', name: '_tokenOut', type: 'address' },
            { internalType: 'bytes', name: '_data', type: 'bytes' }
        ],
        name: 'dexCallWithReceiver',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'paused',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_dex', type: 'address' },
            { internalType: 'address', name: '_tokenIn', type: 'address' },
            { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
            { internalType: 'address', name: '_tokenOut', type: 'address' },
            { internalType: 'bytes', name: '_data', type: 'bytes' }
        ],
        name: 'simulateSwap',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_tokenIn', type: 'address' },
            { internalType: 'uint256', name: '_amountIn', type: 'uint256' }
        ],
        name: 'simulateTransfer',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    }
];
