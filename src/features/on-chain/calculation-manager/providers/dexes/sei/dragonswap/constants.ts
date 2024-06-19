import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { defaultSeiProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/sei/default-constants';
import { AbiItem } from 'web3-utils';

export const DRAGON_SWAP_CONTRACT_ADDRESS = '0xa4cF2F53D1195aDDdE9e4D3aCa54f556895712f2';

export const DRAGON_SWAP_PROVIDER_CONFIGURATION: UniswapV2ProviderConfiguration = {
    ...defaultSeiProviderConfiguration,
    maxTransitTokens: 2
};

export const DRAGON_SWAP_CONTRACT_ABI = [
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'amountOut',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'reserveIn',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'reserveOut',
                type: 'uint256'
            }
        ],
        name: 'getAmountIn',
        outputs: [
            {
                internalType: 'uint256',
                name: 'amountIn',
                type: 'uint256'
            }
        ],
        stateMutability: 'pure',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'amountIn',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'reserveIn',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'reserveOut',
                type: 'uint256'
            }
        ],
        name: 'getAmountOut',
        outputs: [
            {
                internalType: 'uint256',
                name: 'amountOut',
                type: 'uint256'
            }
        ],
        stateMutability: 'pure',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'amountOut',
                type: 'uint256'
            },
            {
                internalType: 'address[]',
                name: 'path',
                type: 'address[]'
            }
        ],
        name: 'getAmountsIn',
        outputs: [
            {
                internalType: 'uint256[]',
                name: 'amounts',
                type: 'uint256[]'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'amountIn',
                type: 'uint256'
            },
            {
                internalType: 'address[]',
                name: 'path',
                type: 'address[]'
            }
        ],
        name: 'getAmountsOut',
        outputs: [
            {
                internalType: 'uint256[]',
                name: 'amounts',
                type: 'uint256[]'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    // SEI → any
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'amountOutMin',
                type: 'uint256'
            },
            {
                internalType: 'address[]',
                name: 'path',
                type: 'address[]'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'deadline',
                type: 'uint256'
            }
        ],
        name: 'swapExactSEIForTokens',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'payable',
        type: 'function'
    },
    // Any → SEI
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'amountIn',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'amountOutMin',
                type: 'uint256'
            },
            {
                internalType: 'address[]',
                name: 'path',
                type: 'address[]'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'deadline',
                type: 'uint256'
            }
        ],
        name: 'swapExactTokensForSEI',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'amountIn',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'amountOutMin',
                type: 'uint256'
            },
            {
                internalType: 'address[]',
                name: 'path',
                type: 'address[]'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'deadline',
                type: 'uint256'
            }
        ],
        name: 'swapExactTokensForTokens',
        outputs: [
            {
                internalType: 'uint256[]',
                name: 'amounts',
                type: 'uint256[]'
            }
        ],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'amountOutMin',
                type: 'uint256'
            },
            {
                internalType: 'address[]',
                name: 'path',
                type: 'address[]'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'deadline',
                type: 'uint256'
            }
        ],
        name: 'swapExactSEIForTokensSupportingFeeOnTransferTokens',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'amountIn',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'amountOutMin',
                type: 'uint256'
            },
            {
                internalType: 'address[]',
                name: 'path',
                type: 'address[]'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'deadline',
                type: 'uint256'
            }
        ],
        name: 'swapExactTokensForSEISupportingFeeOnTransferTokens',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'amountIn',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'amountOutMin',
                type: 'uint256'
            },
            {
                internalType: 'address[]',
                name: 'path',
                type: 'address[]'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'deadline',
                type: 'uint256'
            }
        ],
        name: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    }
] as AbiItem[];
