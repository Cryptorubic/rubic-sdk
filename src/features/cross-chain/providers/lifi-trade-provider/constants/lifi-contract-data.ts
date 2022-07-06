import { AbiItem } from 'web3-utils';

export const lifiContractAddress = '0x43B4be965B07edb5ce1dBaC1c6f3653806F3EE40';

export const lifiContractAbi = [
    {
        inputs: [],
        name: 'RubicFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'integratorFee',
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
        name: 'lifiCall',
        outputs: [],
        stateMutability: 'nonpayable',
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
