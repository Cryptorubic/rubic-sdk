import { AbiItem } from 'web3-utils';

export const foreignBridgeAbi: AbiItem[] = [
    {
        inputs: [{ internalType: 'address', name: '_nativeToken', type: 'address' }],
        name: 'bridgedTokenAddress',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '_token', type: 'address' }],
        name: 'isRegisteredAsNativeToken',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '_token', type: 'address' }],
        name: 'isTokenRegistered',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '_token', type: 'address' }],
        name: 'minPerTx',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '_bridgedToken', type: 'address' }],
        name: 'nativeTokenAddress',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'contract IERC677', name: 'token', type: 'address' },
            { internalType: 'address', name: '_receiver', type: 'address' },
            { internalType: 'uint256', name: '_value', type: 'uint256' }
        ],
        name: 'relayTokens',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_token', type: 'address' },
            { internalType: 'uint256', name: '_amount', type: 'uint256' }
        ],
        name: 'withinExecutionLimit',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_token', type: 'address' },
            { internalType: 'uint256', name: '_amount', type: 'uint256' }
        ],
        name: 'withinLimit',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    }
];
