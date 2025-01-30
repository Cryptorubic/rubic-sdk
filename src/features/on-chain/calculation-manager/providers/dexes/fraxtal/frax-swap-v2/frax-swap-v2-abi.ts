import { AbiItem } from 'web3-utils';

export const FRAXSWAP_V2_ABI: AbiItem[] = [
    {
        inputs: [],
        name: 'WETH',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    },

    {
        inputs: [],
        name: 'factory',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: '', type: 'uint256' },
            { internalType: 'uint256', name: '', type: 'uint256' },
            { internalType: 'uint256', name: '', type: 'uint256' }
        ],
        name: 'getAmountIn',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'pure',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: '', type: 'uint256' },
            { internalType: 'uint256', name: '', type: 'uint256' },
            { internalType: 'uint256', name: '', type: 'uint256' }
        ],
        name: 'getAmountOut',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'pure',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountOut', type: 'uint256' },
            { internalType: 'address[]', name: 'path', type: 'address[]' }
        ],
        name: 'getAmountsIn',
        outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountOut', type: 'uint256' },
            { internalType: 'address[]', name: 'path', type: 'address[]' }
        ],
        name: 'getAmountsInWithTwamm',
        outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
            { internalType: 'address[]', name: 'path', type: 'address[]' }
        ],
        name: 'getAmountsOut',
        outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
            { internalType: 'address[]', name: 'path', type: 'address[]' }
        ],
        name: 'getAmountsOutWithTwamm',
        outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountA', type: 'uint256' },
            { internalType: 'uint256', name: 'reserveA', type: 'uint256' },
            { internalType: 'uint256', name: 'reserveB', type: 'uint256' }
        ],
        name: 'quote',
        outputs: [{ internalType: 'uint256', name: 'amountB', type: 'uint256' }],
        stateMutability: 'pure',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountOut', type: 'uint256' },
            { internalType: 'address[]', name: 'path', type: 'address[]' },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'deadline', type: 'uint256' }
        ],
        name: 'swapETHForExactTokens',
        outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
            { internalType: 'address[]', name: 'path', type: 'address[]' },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'deadline', type: 'uint256' }
        ],
        name: 'swapExactETHForTokens',
        outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
            { internalType: 'address[]', name: 'path', type: 'address[]' },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'deadline', type: 'uint256' }
        ],
        name: 'swapExactETHForTokensSupportingFeeOnTransferTokens',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
            { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
            { internalType: 'address[]', name: 'path', type: 'address[]' },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'deadline', type: 'uint256' }
        ],
        name: 'swapExactTokensForETH',
        outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
            { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
            { internalType: 'address[]', name: 'path', type: 'address[]' },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'deadline', type: 'uint256' }
        ],
        name: 'swapExactTokensForETHSupportingFeeOnTransferTokens',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
            { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
            { internalType: 'address[]', name: 'path', type: 'address[]' },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'deadline', type: 'uint256' }
        ],
        name: 'swapExactTokensForTokens',
        outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
            { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
            { internalType: 'address[]', name: 'path', type: 'address[]' },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'deadline', type: 'uint256' }
        ],
        name: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountOut', type: 'uint256' },
            { internalType: 'uint256', name: 'amountInMax', type: 'uint256' },
            { internalType: 'address[]', name: 'path', type: 'address[]' },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'deadline', type: 'uint256' }
        ],
        name: 'swapTokensForExactETH',
        outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountOut', type: 'uint256' },
            { internalType: 'uint256', name: 'amountInMax', type: 'uint256' },
            { internalType: 'address[]', name: 'path', type: 'address[]' },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'deadline', type: 'uint256' }
        ],
        name: 'swapTokensForExactTokens',
        outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    { stateMutability: 'payable', type: 'receive' }
];
