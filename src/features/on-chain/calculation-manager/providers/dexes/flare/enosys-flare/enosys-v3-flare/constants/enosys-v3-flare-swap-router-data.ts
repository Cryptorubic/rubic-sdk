import { AbiItem } from 'web3-utils';

export const ENOSYS_V3_SWAP_ROUTER_CONTRACT_ADDRESS = '0x5FD34090E9b195d8482Ad3CC63dB078534F1b113';

export const ENOSYS_V3_SWAP_ROUTER_CONTRACT_ABI: AbiItem[] = [
    {
        type: 'constructor',
        inputs: [
            { internalType: 'address', name: '_factory', type: 'address' },
            { internalType: 'bytes32', name: '_poolInitCodeHash', type: 'bytes32' },
            { internalType: 'address', name: '_wnat', type: 'address' }
        ],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'enosysdexV3SwapCallback',
        inputs: [
            { internalType: 'int256', name: 'amount0Delta', type: 'int256' },
            { internalType: 'int256', name: 'amount1Delta', type: 'int256' },
            { internalType: 'bytes', name: '_data', type: 'bytes' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'exactInput',
        inputs: [
            {
                internalType: 'struct ISwapRouter.ExactInputParams',
                name: 'params',
                type: 'tuple',
                components: [
                    { internalType: 'bytes', name: 'path', type: 'bytes' },
                    { internalType: 'address', name: 'recipient', type: 'address' },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ]
            }
        ],
        outputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }],
        stateMutability: 'payable'
    },
    {
        type: 'function',
        name: 'exactInputSingle',
        inputs: [
            {
                internalType: 'struct ISwapRouter.ExactInputSingleParams',
                name: 'params',
                type: 'tuple',
                components: [
                    { internalType: 'address', name: 'tokenIn', type: 'address' },
                    { internalType: 'address', name: 'tokenOut', type: 'address' },
                    { internalType: 'uint24', name: 'fee', type: 'uint24' },
                    { internalType: 'address', name: 'recipient', type: 'address' },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' },
                    { internalType: 'uint160', name: 'sqrtPriceLimitX96', type: 'uint160' }
                ]
            }
        ],
        outputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }],
        stateMutability: 'payable'
    },
    {
        type: 'function',
        name: 'exactOutput',
        inputs: [
            {
                internalType: 'struct ISwapRouter.ExactOutputParams',
                name: 'params',
                type: 'tuple',
                components: [
                    { internalType: 'bytes', name: 'path', type: 'bytes' },
                    { internalType: 'address', name: 'recipient', type: 'address' },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOut', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountInMaximum', type: 'uint256' }
                ]
            }
        ],
        outputs: [{ internalType: 'uint256', name: 'amountIn', type: 'uint256' }],
        stateMutability: 'payable'
    },
    {
        type: 'function',
        name: 'exactOutputSingle',
        inputs: [
            {
                internalType: 'struct ISwapRouter.ExactOutputSingleParams',
                name: 'params',
                type: 'tuple',
                components: [
                    { internalType: 'address', name: 'tokenIn', type: 'address' },
                    { internalType: 'address', name: 'tokenOut', type: 'address' },
                    { internalType: 'uint24', name: 'fee', type: 'uint24' },
                    { internalType: 'address', name: 'recipient', type: 'address' },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOut', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountInMaximum', type: 'uint256' },
                    { internalType: 'uint160', name: 'sqrtPriceLimitX96', type: 'uint160' }
                ]
            }
        ],
        outputs: [{ internalType: 'uint256', name: 'amountIn', type: 'uint256' }],
        stateMutability: 'payable'
    },
    {
        type: 'function',
        name: 'multicall',
        inputs: [{ internalType: 'bytes[]', name: 'data', type: 'bytes[]' }],
        outputs: [{ internalType: 'bytes[]', name: 'results', type: 'bytes[]' }],
        stateMutability: 'payable'
    },
    {
        type: 'function',
        name: 'refundETH',
        inputs: [],
        outputs: [],
        stateMutability: 'payable'
    },
    {
        type: 'function',
        name: 'sweepToken',
        inputs: [
            { internalType: 'address', name: 'token', type: 'address' },
            { internalType: 'uint256', name: 'amountMinimum', type: 'uint256' },
            { internalType: 'address', name: 'recipient', type: 'address' }
        ],
        outputs: [],
        stateMutability: 'payable'
    },
    {
        type: 'function',
        name: 'unwrapWNat',
        inputs: [
            { internalType: 'uint256', name: 'amountMinimum', type: 'uint256' },
            { internalType: 'address', name: 'recipient', type: 'address' }
        ],
        outputs: [],
        stateMutability: 'payable'
    },
    {
        type: 'function',
        name: 'factory',
        inputs: [],
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'wnat',
        inputs: [],
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view'
    }
];
