import { AbiItem } from 'web3-utils';

export const HORIZONDEX_QUOTER_CONTRACT_ADDRESS = '0x07AceD5690e09935b1c0e6E88B772d9440F64718';

export const HORIZONDEX_QUOTER_CONTRACT_ABI = [
    {
        inputs: [
            { internalType: 'bytes', name: 'path', type: 'bytes' },
            { internalType: 'uint256', name: 'amountIn', type: 'uint256' }
        ],
        name: 'quoteExactInput',
        outputs: [
            { internalType: 'uint256', name: 'amountOut', type: 'uint256' },
            { internalType: 'uint160[]', name: 'afterSqrtPList', type: 'uint160[]' },
            { internalType: 'uint32[]', name: 'initializedTicksCrossedList', type: 'uint32[]' },
            { internalType: 'uint256', name: 'gasEstimate', type: 'uint256' }
        ],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                components: [
                    { internalType: 'address', name: 'tokenIn', type: 'address' },
                    { internalType: 'address', name: 'tokenOut', type: 'address' },
                    { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
                    { internalType: 'uint24', name: 'feeUnits', type: 'uint24' },
                    { internalType: 'uint160', name: 'limitSqrtP', type: 'uint160' }
                ],
                internalType: 'struct IQuoterV2.QuoteExactInputSingleParams',
                name: 'params',
                type: 'tuple'
            }
        ],
        name: 'quoteExactInputSingle',
        outputs: [
            {
                components: [
                    { internalType: 'uint256', name: 'usedAmount', type: 'uint256' },
                    { internalType: 'uint256', name: 'returnedAmount', type: 'uint256' },
                    { internalType: 'uint160', name: 'afterSqrtP', type: 'uint160' },
                    { internalType: 'uint32', name: 'initializedTicksCrossed', type: 'uint32' },
                    { internalType: 'uint256', name: 'gasEstimate', type: 'uint256' }
                ],
                internalType: 'struct IQuoterV2.QuoteOutput',
                name: 'output',
                type: 'tuple'
            }
        ],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'bytes', name: 'path', type: 'bytes' },
            { internalType: 'uint256', name: 'amountOut', type: 'uint256' }
        ],
        name: 'quoteExactOutput',
        outputs: [
            { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
            { internalType: 'uint160[]', name: 'afterSqrtPList', type: 'uint160[]' },
            { internalType: 'uint32[]', name: 'initializedTicksCrossedList', type: 'uint32[]' },
            { internalType: 'uint256', name: 'gasEstimate', type: 'uint256' }
        ],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                components: [
                    { internalType: 'address', name: 'tokenIn', type: 'address' },
                    { internalType: 'address', name: 'tokenOut', type: 'address' },
                    { internalType: 'uint256', name: 'amount', type: 'uint256' },
                    { internalType: 'uint24', name: 'feeUnits', type: 'uint24' },
                    { internalType: 'uint160', name: 'limitSqrtP', type: 'uint160' }
                ],
                internalType: 'struct IQuoterV2.QuoteExactOutputSingleParams',
                name: 'params',
                type: 'tuple'
            }
        ],
        name: 'quoteExactOutputSingle',
        outputs: [
            {
                components: [
                    { internalType: 'uint256', name: 'usedAmount', type: 'uint256' },
                    { internalType: 'uint256', name: 'returnedAmount', type: 'uint256' },
                    { internalType: 'uint160', name: 'afterSqrtP', type: 'uint160' },
                    { internalType: 'uint32', name: 'initializedTicksCrossed', type: 'uint32' },
                    { internalType: 'uint256', name: 'gasEstimate', type: 'uint256' }
                ],
                internalType: 'struct IQuoterV2.QuoteOutput',
                name: 'output',
                type: 'tuple'
            }
        ],
        stateMutability: 'nonpayable',
        type: 'function'
    }
] as AbiItem[];
