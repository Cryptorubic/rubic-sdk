import { AbiItem } from 'web3-utils';

export const ENOSYS_V3_FLARE_QUOTER_CONTRACT_ADDRESS = '0x0A32EE3f66cC9E68ffb7cBeCf77bAef03e2d7C56';

export const ENOSYS_V3_FLARE_QUOTER_CONTRACT_ABI: AbiItem[] = [
    {
        type: 'constructor',
        inputs: [
            { internalType: 'address', name: '_factory', type: 'address' },
            { internalType: 'bytes32', name: '_poolInitCodeHash', type: 'bytes32' }
        ],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'enosysdexV3SwapCallback',
        inputs: [
            { internalType: 'int256', name: 'amount0Delta', type: 'int256' },
            { internalType: 'int256', name: 'amount1Delta', type: 'int256' },
            { internalType: 'bytes', name: 'path', type: 'bytes' }
        ],
        outputs: [],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'factory_',
        inputs: [],
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'quoteExactInput',
        inputs: [
            { internalType: 'bytes', name: 'path', type: 'bytes' },
            { internalType: 'uint256', name: 'amountIn', type: 'uint256' }
        ],
        outputs: [
            { internalType: 'uint256', name: 'amountOut', type: 'uint256' },
            { internalType: 'uint160[]', name: 'sqrtPriceX96AfterList', type: 'uint160[]' },
            { internalType: 'uint32[]', name: 'initializedTicksCrossedList', type: 'uint32[]' },
            { internalType: 'uint256', name: 'gasEstimate', type: 'uint256' }
        ],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'quoteExactInputSingle',
        inputs: [
            {
                internalType: 'tuple',
                name: 'params',
                type: 'tuple',
                components: [
                    { internalType: 'address', name: 'tokenIn', type: 'address' },
                    { internalType: 'address', name: 'tokenOut', type: 'address' },
                    { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
                    { internalType: 'uint24', name: 'fee', type: 'uint24' },
                    { internalType: 'uint160', name: 'sqrtPriceLimitX96', type: 'uint160' }
                ]
            }
        ],
        outputs: [
            { internalType: 'uint256', name: 'amountOut', type: 'uint256' },
            { internalType: 'uint160', name: 'sqrtPriceX96After', type: 'uint160' },
            { internalType: 'uint32', name: 'initializedTicksCrossed', type: 'uint32' },
            { internalType: 'uint256', name: 'gasEstimate', type: 'uint256' }
        ],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'quoteExactOutput',
        inputs: [
            { internalType: 'bytes', name: 'path', type: 'bytes' },
            { internalType: 'uint256', name: 'amountOut', type: 'uint256' }
        ],
        outputs: [
            { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
            { internalType: 'uint160[]', name: 'sqrtPriceX96AfterList', type: 'uint160[]' },
            { internalType: 'uint32[]', name: 'initializedTicksCrossedList', type: 'uint32[]' },
            { internalType: 'uint256', name: 'gasEstimate', type: 'uint256' }
        ],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'quoteExactOutputSingle',
        inputs: [
            {
                internalType: 'tuple',
                name: 'params',
                type: 'tuple',
                components: [
                    { internalType: 'address', name: 'tokenIn', type: 'address' },
                    { internalType: 'address', name: 'tokenOut', type: 'address' },
                    { internalType: 'uint256', name: 'amount', type: 'uint256' },
                    { internalType: 'uint24', name: 'fee', type: 'uint24' },
                    { internalType: 'uint160', name: 'sqrtPriceLimitX96', type: 'uint160' }
                ]
            }
        ],
        outputs: [
            { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
            { internalType: 'uint160', name: 'sqrtPriceX96After', type: 'uint160' },
            { internalType: 'uint32', name: 'initializedTicksCrossed', type: 'uint32' },
            { internalType: 'uint256', name: 'gasEstimate', type: 'uint256' }
        ],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'wnat',
        inputs: [],
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view'
    }
];
