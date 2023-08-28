import { AbiItem } from 'web3-utils';

export const SCROLL_UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI: AbiItem[] = [
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [{ type: 'uint256', name: 'amountOut', internalType: 'uint256' }],
        name: 'exactInput',
        inputs: [
            {
                type: 'tuple',
                name: 'params',
                internalType: 'struct IV3SwapRouter.ExactInputParams',
                components: [
                    { type: 'bytes', name: 'path', internalType: 'bytes' },
                    { type: 'address', name: 'recipient', internalType: 'address' },
                    { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
                    { type: 'uint256', name: 'amountOutMinimum', internalType: 'uint256' }
                ]
            }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [{ type: 'uint256', name: 'amountOut', internalType: 'uint256' }],
        name: 'exactInputSingle',
        inputs: [
            {
                type: 'tuple',
                name: 'params',
                internalType: 'struct IV3SwapRouter.ExactInputSingleParams',
                components: [
                    { type: 'address', name: 'tokenIn', internalType: 'address' },
                    { type: 'address', name: 'tokenOut', internalType: 'address' },
                    { type: 'uint24', name: 'fee', internalType: 'uint24' },
                    { type: 'address', name: 'recipient', internalType: 'address' },
                    { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
                    { type: 'uint256', name: 'amountOutMinimum', internalType: 'uint256' },
                    { type: 'uint160', name: 'sqrtPriceLimitX96', internalType: 'uint160' }
                ]
            }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [{ type: 'uint256', name: 'amountIn', internalType: 'uint256' }],
        name: 'exactOutput',
        inputs: [
            {
                type: 'tuple',
                name: 'params',
                internalType: 'struct IV3SwapRouter.ExactOutputParams',
                components: [
                    { type: 'bytes', name: 'path', internalType: 'bytes' },
                    { type: 'address', name: 'recipient', internalType: 'address' },
                    { type: 'uint256', name: 'amountOut', internalType: 'uint256' },
                    { type: 'uint256', name: 'amountInMaximum', internalType: 'uint256' }
                ]
            }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [{ type: 'uint256', name: 'amountIn', internalType: 'uint256' }],
        name: 'exactOutputSingle',
        inputs: [
            {
                type: 'tuple',
                name: 'params',
                internalType: 'struct IV3SwapRouter.ExactOutputSingleParams',
                components: [
                    { type: 'address', name: 'tokenIn', internalType: 'address' },
                    { type: 'address', name: 'tokenOut', internalType: 'address' },
                    { type: 'uint24', name: 'fee', internalType: 'uint24' },
                    { type: 'address', name: 'recipient', internalType: 'address' },
                    { type: 'uint256', name: 'amountOut', internalType: 'uint256' },
                    { type: 'uint256', name: 'amountInMaximum', internalType: 'uint256' },
                    { type: 'uint160', name: 'sqrtPriceLimitX96', internalType: 'uint160' }
                ]
            }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [{ type: 'bytes[]', name: 'results', internalType: 'bytes[]' }],
        name: 'multicall',
        inputs: [{ type: 'bytes[]', name: 'data', internalType: 'bytes[]' }]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'unwrapWETH9',
        inputs: [
            { type: 'uint256', name: 'amountMinimum', internalType: 'uint256' },
            { type: 'address', name: 'recipient', internalType: 'address' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'unwrapWETH9',
        inputs: [{ type: 'uint256', name: 'amountMinimum', internalType: 'uint256' }]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'unwrapWETH9WithFee',
        inputs: [
            { type: 'uint256', name: 'amountMinimum', internalType: 'uint256' },
            { type: 'address', name: 'recipient', internalType: 'address' },
            { type: 'uint256', name: 'feeBips', internalType: 'uint256' },
            { type: 'address', name: 'feeRecipient', internalType: 'address' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'unwrapWETH9WithFee',
        inputs: [
            { type: 'uint256', name: 'amountMinimum', internalType: 'uint256' },
            { type: 'uint256', name: 'feeBips', internalType: 'uint256' },
            { type: 'address', name: 'feeRecipient', internalType: 'address' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'wrapETH',
        inputs: [{ type: 'uint256', name: 'value', internalType: 'uint256' }]
    }
];
