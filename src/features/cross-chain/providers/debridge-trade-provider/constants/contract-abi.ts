import { AbiItem } from 'web3-utils';

export const DE_BRIDGE_CONTRACT_ABI = [
    {
        inputs: [],
        name: 'RubicPlatformFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'contract IERC20', name: 'inputToken', type: 'address' },
            { internalType: 'uint256', name: 'totalInputAmount', type: 'uint256' },
            { internalType: 'address', name: 'integrator', type: 'address' },
            { internalType: 'bytes', name: 'data', type: 'bytes' }
        ],
        name: 'deBridgeCall',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: 'integrator', type: 'address' },
            { internalType: 'bytes', name: 'data', type: 'bytes' }
        ],
        name: 'deBridgeCallCallWithNative',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'availableIntegratorFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'paused',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    }
] as AbiItem[];
