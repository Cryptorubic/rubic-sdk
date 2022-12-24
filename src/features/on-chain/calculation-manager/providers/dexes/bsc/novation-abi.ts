import { AbiItem } from 'web3-utils';

export const NOVATION_ABI = [
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'buy',
        inputs: [
            { type: 'uint', name: '_amountOutMin', internalType: 'uint' },
            { type: 'address', name: '_token', internalType: 'address' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [],
        name: 'sell',
        inputs: [
            { type: 'address', name: '_token', internalType: 'address' },
            { type: 'uint', name: '_amountIn', internalType: 'uint' },
            { type: 'uint', name: '_amountOutMin', internalType: 'uint' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [
            { type: 'uint', name: 'amountOut', internalType: 'uint' },
            { type: 'uint', name: 'afterTax', internalType: 'uint' }
        ],
        name: 'getAmountOutFromBuy',
        inputs: [
            { type: 'address', name: '_token', internalType: 'address' },
            { type: 'uint', name: '_amountIn', internalType: 'uint' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [
            { type: 'uint', name: 'amountIn', internalType: 'uint' },
            { type: 'uint', name: 'afterTax', internalType: 'uint' }
        ],
        name: 'getAmountInFromBuy',
        inputs: [
            { type: 'address', name: '_token', internalType: 'address' },
            { type: 'uint', name: '_amountOut', internalType: 'uint' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [
            { type: 'uint', name: 'amountOut', internalType: 'uint' },
            { type: 'uint', name: 'afterTax', internalType: 'uint' }
        ],
        name: 'getAmountOutFromSell',
        inputs: [
            { type: 'address', name: '_token', internalType: 'address' },
            { type: 'uint', name: '_amountIn', internalType: 'uint' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [
            { type: 'uint', name: 'amountIn', internalType: 'uint' },
            { type: 'uint', name: 'afterTax', internalType: 'uint' }
        ],
        name: 'getAmountInFromSell',
        inputs: [
            { type: 'address', name: '_token', internalType: 'address' },
            { type: 'uint', name: '_amountOut', internalType: 'uint' }
        ]
    }
] as AbiItem[];
