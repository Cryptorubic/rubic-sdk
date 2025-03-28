import { AbiItem } from 'web3-utils';

export const BRONTO_FINANCE_QUOTER_CONTRACT_ADDRESS = '0x4eea84bfc155983442cf655B323dC9861Bdb4f7f';

export const BRONTO_FINANCE_QUOTER_CONTRACT_ABI: AbiItem[] = [
    {
        type: 'constructor',
        inputs: [
            {
                name: '_factory',
                type: 'address',
                internalType: 'address'
            },
            {
                name: '_WETH9',
                type: 'address',
                internalType: 'address'
            }
        ],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'WETH9',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'address',
                internalType: 'address'
            }
        ],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'factory',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'address',
                internalType: 'address'
            }
        ],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'quoteExactInput',
        inputs: [
            {
                name: 'path',
                type: 'bytes',
                internalType: 'bytes'
            },
            {
                name: 'amountIn',
                type: 'uint256',
                internalType: 'uint256'
            }
        ],
        outputs: [
            {
                name: 'amountOut',
                type: 'uint256',
                internalType: 'uint256'
            },
            {
                name: 'sqrtPriceX96AfterList',
                type: 'uint160[]',
                internalType: 'uint160[]'
            },
            {
                name: 'initializedTicksCrossedList',
                type: 'uint32[]',
                internalType: 'uint32[]'
            },
            {
                name: 'gasEstimate',
                type: 'uint256',
                internalType: 'uint256'
            }
        ],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'quoteExactInputSingle',
        inputs: [
            {
                name: 'params',
                type: 'tuple',
                internalType: 'struct IQuoterV2.QuoteExactInputSingleParams',
                components: [
                    {
                        name: 'tokenIn',
                        type: 'address',
                        internalType: 'address'
                    },
                    {
                        name: 'tokenOut',
                        type: 'address',
                        internalType: 'address'
                    },
                    {
                        name: 'amountIn',
                        type: 'uint256',
                        internalType: 'uint256'
                    },
                    {
                        name: 'tickSpacing',
                        type: 'int24',
                        internalType: 'int24'
                    },
                    {
                        name: 'sqrtPriceLimitX96',
                        type: 'uint160',
                        internalType: 'uint160'
                    }
                ]
            }
        ],
        outputs: [
            {
                name: 'amountOut',
                type: 'uint256',
                internalType: 'uint256'
            },
            {
                name: 'sqrtPriceX96After',
                type: 'uint160',
                internalType: 'uint160'
            },
            {
                name: 'initializedTicksCrossed',
                type: 'uint32',
                internalType: 'uint32'
            },
            {
                name: 'gasEstimate',
                type: 'uint256',
                internalType: 'uint256'
            }
        ],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'quoteExactOutput',
        inputs: [
            {
                name: 'path',
                type: 'bytes',
                internalType: 'bytes'
            },
            {
                name: 'amountOut',
                type: 'uint256',
                internalType: 'uint256'
            }
        ],
        outputs: [
            {
                name: 'amountIn',
                type: 'uint256',
                internalType: 'uint256'
            },
            {
                name: 'sqrtPriceX96AfterList',
                type: 'uint160[]',
                internalType: 'uint160[]'
            },
            {
                name: 'initializedTicksCrossedList',
                type: 'uint32[]',
                internalType: 'uint32[]'
            },
            {
                name: 'gasEstimate',
                type: 'uint256',
                internalType: 'uint256'
            }
        ],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'quoteExactOutputSingle',
        inputs: [
            {
                name: 'params',
                type: 'tuple',
                internalType: 'struct IQuoterV2.QuoteExactOutputSingleParams',
                components: [
                    {
                        name: 'tokenIn',
                        type: 'address',
                        internalType: 'address'
                    },
                    {
                        name: 'tokenOut',
                        type: 'address',
                        internalType: 'address'
                    },
                    {
                        name: 'amount',
                        type: 'uint256',
                        internalType: 'uint256'
                    },
                    {
                        name: 'tickSpacing',
                        type: 'int24',
                        internalType: 'int24'
                    },
                    {
                        name: 'sqrtPriceLimitX96',
                        type: 'uint160',
                        internalType: 'uint160'
                    }
                ]
            }
        ],
        outputs: [
            {
                name: 'amountIn',
                type: 'uint256',
                internalType: 'uint256'
            },
            {
                name: 'sqrtPriceX96After',
                type: 'uint160',
                internalType: 'uint160'
            },
            {
                name: 'initializedTicksCrossed',
                type: 'uint32',
                internalType: 'uint32'
            },
            {
                name: 'gasEstimate',
                type: 'uint256',
                internalType: 'uint256'
            }
        ],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'uniswapV3SwapCallback',
        inputs: [
            {
                name: 'amount0Delta',
                type: 'int256',
                internalType: 'int256'
            },
            {
                name: 'amount1Delta',
                type: 'int256',
                internalType: 'int256'
            },
            {
                name: 'path',
                type: 'bytes',
                internalType: 'bytes'
            }
        ],
        outputs: [],
        stateMutability: 'view'
    }
];
