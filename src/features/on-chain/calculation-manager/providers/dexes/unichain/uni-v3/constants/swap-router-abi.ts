import { AbiItem } from 'web3-utils';

export const UNICHAIN_UNISWAP_V3_SWAP_ROUTER_ABI = [
    {
        inputs: [
            {
                components: [
                    { internalType: 'bytes', name: 'path', type: 'bytes' },
                    { internalType: 'address', name: 'recipient', type: 'address' },
                    { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct IV3SwapRouter.ExactInputParams',
                name: 'params',
                type: 'tuple'
            }
        ],
        name: 'exactInput',
        outputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                components: [
                    { internalType: 'address', name: 'tokenIn', type: 'address' },
                    { internalType: 'address', name: 'tokenOut', type: 'address' },
                    { internalType: 'uint24', name: 'fee', type: 'uint24' },
                    { internalType: 'address', name: 'recipient', type: 'address' },
                    { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' },
                    { internalType: 'uint160', name: 'sqrtPriceLimitX96', type: 'uint160' }
                ],
                internalType: 'struct IV3SwapRouter.ExactInputSingleParams',
                name: 'params',
                type: 'tuple'
            }
        ],
        name: 'exactInputSingle',
        outputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
            { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
            { internalType: 'address[]', name: 'path', type: 'address[]' },
            { internalType: 'address', name: 'to', type: 'address' }
        ],
        name: 'swapExactTokensForTokens',
        outputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountOut', type: 'uint256' },
            { internalType: 'uint256', name: 'amountInMax', type: 'uint256' },
            { internalType: 'address[]', name: 'path', type: 'address[]' },
            { internalType: 'address', name: 'to', type: 'address' }
        ],
        name: 'swapTokensForExactTokens',
        outputs: [{ internalType: 'uint256', name: 'amountIn', type: 'uint256' }],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'int256', name: 'amount0Delta', type: 'int256' },
            { internalType: 'int256', name: 'amount1Delta', type: 'int256' },
            { internalType: 'bytes', name: '_data', type: 'bytes' }
        ],
        name: 'uniswapV3SwapCallback',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountMinimum', type: 'uint256' },
            { internalType: 'address', name: 'recipient', type: 'address' }
        ],
        name: 'unwrapWETH9',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'bytes[]', name: 'data', type: 'bytes[]' }],
        name: 'multicall',
        outputs: [{ internalType: 'bytes[]', name: 'results', type: 'bytes[]' }],
        stateMutability: 'payable',
        type: 'function'
    }
] as AbiItem[];
