import { AbiItem } from 'web3-utils';

export const registryAbi: AbiItem[] = [
    {
        stateMutability: 'view',
        type: 'function',
        name: 'find_pool_for_coins',
        inputs: [
            { name: '_from', type: 'address' },
            { name: '_to', type: 'address' }
        ],
        outputs: [{ name: '', type: 'address' }]
    }
];
