import { AbiItem } from 'web3-utils';

export const FUSIONX_QUOTER_CONTRACT_ADDRESS = '0x90f72244294E7c5028aFd6a96E18CC2c1E913995';

export const FUSIONX_QUOTER_CONTRACT_ABI = [
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [
            { type: 'uint256', name: 'amountOut', internalType: 'uint256' },
            { type: 'uint160[]', name: 'sqrtPriceX96AfterList', internalType: 'uint160[]' },
            { type: 'uint32[]', name: 'initializedTicksCrossedList', internalType: 'uint32[]' },
            { type: 'uint256', name: 'gasEstimate', internalType: 'uint256' }
        ],
        name: 'quoteExactInput',
        inputs: [
            { type: 'bytes', name: 'path', internalType: 'bytes' },
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [
            { type: 'uint256', name: 'amountOut', internalType: 'uint256' },
            { type: 'uint160', name: 'sqrtPriceX96After', internalType: 'uint160' },
            { type: 'uint32', name: 'initializedTicksCrossed', internalType: 'uint32' },
            { type: 'uint256', name: 'gasEstimate', internalType: 'uint256' }
        ],
        name: 'quoteExactInputSingle',
        inputs: [
            {
                type: 'tuple',
                name: 'params',
                internalType: 'struct IQuoterV2.QuoteExactInputSingleParams',
                components: [
                    { type: 'address' },
                    { type: 'address' },
                    { type: 'uint256' },
                    { type: 'uint24' },
                    { type: 'uint160' }
                ]
            }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'uint160[]', name: 'sqrtPriceX96AfterList', internalType: 'uint160[]' },
            { type: 'uint32[]', name: 'initializedTicksCrossedList', internalType: 'uint32[]' },
            { type: 'uint256', name: 'gasEstimate', internalType: 'uint256' }
        ],
        name: 'quoteExactOutput',
        inputs: [
            { type: 'bytes', name: 'path', internalType: 'bytes' },
            { type: 'uint256', name: 'amountOut', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'uint160', name: 'sqrtPriceX96After', internalType: 'uint160' },
            { type: 'uint32', name: 'initializedTicksCrossed', internalType: 'uint32' },
            { type: 'uint256', name: 'gasEstimate', internalType: 'uint256' }
        ],
        name: 'quoteExactOutputSingle',
        inputs: [
            {
                type: 'tuple',
                name: 'params',
                internalType: 'struct IQuoterV2.QuoteExactOutputSingleParams',
                components: [
                    { type: 'address' },
                    { type: 'address' },
                    { type: 'uint256' },
                    { type: 'uint24' },
                    { type: 'uint160' }
                ]
            }
        ]
    }
] as AbiItem[];
