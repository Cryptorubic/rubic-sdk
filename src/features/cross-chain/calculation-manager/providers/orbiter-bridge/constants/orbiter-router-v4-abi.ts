import { AbiItem } from 'web3-utils';

export const ORBITER_ROUTER_V4_ABI: AbiItem[] = [
    {
        inputs: [
            { name: 'to', type: 'address' },
            { name: 'extra', type: 'bytes' }
        ],
        name: 'transfer',
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { name: 'token', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'extra', type: 'bytes' }
        ],
        name: 'transferToken',
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { name: 'token', type: 'address' },
            { name: 'tos', type: 'address[]' },
            { name: 'values', type: 'uint256[]' },
            { name: 'extras', type: 'bytes[]' }
        ],
        name: 'transferTokens',
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { name: 'token', type: 'address' },
            { name: 'tos', type: 'address[]' },
            { name: 'values', type: 'uint256[]' }
        ],
        name: 'transferTokens',
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { name: 'tos', type: 'address[]' },
            { name: 'values', type: 'uint256[]' }
        ],
        name: 'transfers',
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { name: 'tos', type: 'address[]' },
            { name: 'values', type: 'uint256[]' },
            { name: 'extras', type: 'bytes[]' }
        ],
        name: 'transfers',
        stateMutability: 'payable',
        type: 'function'
    }
];
