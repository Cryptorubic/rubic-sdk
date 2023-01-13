import { AbiItem } from 'web3-utils';

export const KLAY_ABI = [
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'getAmountsIn',
        inputs: [
            { type: 'uint256', name: 'amountOut', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'getAmountsOut',
        inputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'swapExactKLAYForTokens',
        inputs: [
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'swapExactKLAYForTokensSupportingFeeOnTransferTokens',
        inputs: [
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'swapExactTokensForKLAY',
        inputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [],
        name: 'swapExactTokensForKLAYSupportingFeeOnTransferTokens',
        inputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'swapExactTokensForTokens',
        inputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [],
        name: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
        inputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'swapKLAYForExactTokens',
        inputs: [
            { type: 'uint256', name: 'amountOut', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'swapTokensForExactKLAY',
        inputs: [
            { type: 'uint256', name: 'amountOut', internalType: 'uint256' },
            { type: 'uint256', name: 'amountInMax', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'swapTokensForExactTokens',
        inputs: [
            { type: 'uint256', name: 'amountOut', internalType: 'uint256' },
            { type: 'uint256', name: 'amountInMax', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    }
] as AbiItem[];
