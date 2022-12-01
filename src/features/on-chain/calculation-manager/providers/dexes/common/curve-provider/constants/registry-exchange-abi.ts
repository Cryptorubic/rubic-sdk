import { AbiItem } from 'web3-utils';

export const registryExchangeAbi: AbiItem[] = [
    {
        stateMutability: 'payable',
        type: 'function',
        name: 'exchange',
        inputs: [
            { name: '_pool', type: 'address' },
            { name: '_from', type: 'address' },
            { name: '_to', type: 'address' },
            { name: '_amount', type: 'uint256' },
            { name: '_expected', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'uint256' }],
        gas: 427142
    },
    {
        stateMutability: 'payable',
        type: 'function',
        name: 'exchange',
        inputs: [
            { name: '_pool', type: 'address' },
            { name: '_from', type: 'address' },
            { name: '_to', type: 'address' },
            { name: '_amount', type: 'uint256' },
            { name: '_expected', type: 'uint256' },
            { name: '_receiver', type: 'address' }
        ],
        outputs: [{ name: '', type: 'uint256' }],
        gas: 427142
    },
    {
        stateMutability: 'view',
        type: 'function',
        name: 'get_best_rate',
        inputs: [
            { name: '_from', type: 'address' },
            { name: '_to', type: 'address' },
            { name: '_amount', type: 'uint256' }
        ],
        outputs: [
            { name: '', type: 'address' },
            { name: '', type: 'uint256' }
        ],
        gas: 3002213116
    }
];
