import { AbiItem } from 'web3-utils';

export const ORBITER_ABI: AbiItem[] = [
    {
        inputs: [
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'bytes',
                name: 'data',
                type: 'bytes'
            }
        ],
        name: 'transfer',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'contract IERC20',
                name: 'token',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'value',
                type: 'uint256'
            },
            {
                internalType: 'bytes',
                name: 'data',
                type: 'bytes'
            }
        ],
        name: 'transferToken',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    }
];
