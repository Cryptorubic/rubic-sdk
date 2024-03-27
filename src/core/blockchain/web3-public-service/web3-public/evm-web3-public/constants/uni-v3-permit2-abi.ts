import { AbiItem } from 'web3-utils';

export const UNI_V3_PERMIT_2_ABI = [
    {
        inputs: [
            {
                internalType: 'address',
                name: 'owner',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'token',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'spender',
                type: 'address'
            }
        ],
        name: 'allowance',
        outputs: [
            {
                internalType: 'uint160',
                name: 'amount',
                type: 'uint160'
            },
            {
                internalType: 'uint48',
                name: 'expiration',
                type: 'uint48'
            },
            {
                internalType: 'uint48',
                name: 'nonce',
                type: 'uint48'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'token',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'spender',
                type: 'address'
            },
            {
                internalType: 'uint160',
                name: 'amount',
                type: 'uint160'
            },
            {
                internalType: 'uint48',
                name: 'expiration',
                type: 'uint48'
            }
        ],
        name: 'approve',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    }
] as AbiItem[];
