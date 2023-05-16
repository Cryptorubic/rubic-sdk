import { AbiItem } from 'web3-utils';

export const syncSwapFactoryAbi: AbiItem[] = [
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            },
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        name: 'getPool',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    }
];
