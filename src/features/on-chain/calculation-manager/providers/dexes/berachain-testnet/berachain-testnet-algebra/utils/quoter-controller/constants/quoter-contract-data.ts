import { AbiItem } from 'web3-utils';

export const BERACHAIN_TESTNET_ALGEBRA_QUOTER_CONTRACT_ADDRESS =
    '0x298603815c244835CBFB4E005B0278e8C87a3C66';

export const BERACHAIN_TESTNET_ALGEBRA_QUOTER_CONTRACT_ABI = [
    {
        inputs: [
            { internalType: 'bytes', name: 'path', type: 'bytes' },
            { internalType: 'uint256', name: 'amountIn', type: 'uint256' }
        ],
        name: 'quoteExactInput',
        outputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: 'tokenIn', type: 'address' },
            { internalType: 'address', name: 'tokenOut', type: 'address' },
            { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
            { internalType: 'uint160', name: 'limitSqrtPrice', type: 'uint160' }
        ],
        name: 'quoteExactInputSingle',
        outputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'bytes', name: 'path', type: 'bytes' },
            { internalType: 'uint256', name: 'amountOut', type: 'uint256' }
        ],
        name: 'quoteExactOutput',
        outputs: [{ internalType: 'uint256', name: 'amountIn', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: 'tokenIn', type: 'address' },
            { internalType: 'address', name: 'tokenOut', type: 'address' },
            { internalType: 'uint256', name: 'amountOut', type: 'uint256' },
            { internalType: 'uint160', name: 'limitSqrtPrice', type: 'uint160' }
        ],
        name: 'quoteExactOutputSingle',
        outputs: [{ internalType: 'uint256', name: 'amountIn', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function'
    }
] as AbiItem[];
