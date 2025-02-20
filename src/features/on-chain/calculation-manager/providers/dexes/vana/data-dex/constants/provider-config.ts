import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { UniswapV3AlgebraProviderConfiguration } from '../../../common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-provider-configuration';
import { AbiItem } from 'web3-utils';
export const DATA_DEX_ROUTER_CONTRACT_ADDRESS = '0xeb40cbe65764202E28BcdB1e318adFdF8b2f2A3b';
export const DATA_DEX_QUOTER_CONTRACT_ADDRESS = '0x1b13728ea3C90863990aC0e05987CfeC1888908c';
export const DATA_DEX_FACTORY_CRONTRACT_ADDRESS = '0xc2a0d530e57B1275fbce908031DA636f95EA1E38';

export const DATA_DEX_PROVIDER_CONFIGURATION: UniswapV3AlgebraProviderConfiguration = {
    wethAddress: wrappedNativeTokensList[BLOCKCHAIN_NAME.VANA]!.address,
    maxTransitTokens: 1
};


export const DATA_DEX_ROUTER_CONTRACT_ABI: AbiItem[] = [
    {
        inputs: [
            {
                components: [
                    {
                        internalType: 'bytes',
                        name: 'path',
                        type: 'bytes'
                    },
                    {
                        internalType: 'address',
                        name: 'recipient',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'amountIn',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'amountOutMinimum',
                        type: 'uint256'
                    }
                ],
                internalType: 'struct IV3SwapRouter.ExactInputParams',
                name: 'params',
                type: 'tuple'
            }
        ],
        name: 'exactInput',
        outputs: [
            {
                internalType: 'uint256',
                name: 'amountOut',
                type: 'uint256'
            }
        ],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: 'address',
                        name: 'tokenIn',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'tokenOut',
                        type: 'address'
                    },
                    {
                        internalType: 'uint24',
                        name: 'fee',
                        type: 'uint24'
                    },
                    {
                        internalType: 'address',
                        name: 'recipient',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'amountIn',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'amountOutMinimum',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint160',
                        name: 'sqrtPriceLimitX96',
                        type: 'uint160'
                    }
                ],
                internalType: 'struct IV3SwapRouter.ExactInputSingleParams',
                name: 'params',
                type: 'tuple'
            }
        ],
        name: 'exactInputSingle',
        outputs: [
            {
                internalType: 'uint256',
                name: 'amountOut',
                type: 'uint256'
            }
        ],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: 'bytes',
                        name: 'path',
                        type: 'bytes'
                    },
                    {
                        internalType: 'address',
                        name: 'recipient',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'amountOut',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'amountInMaximum',
                        type: 'uint256'
                    }
                ],
                internalType: 'struct IV3SwapRouter.ExactOutputParams',
                name: 'params',
                type: 'tuple'
            }
        ],
        name: 'exactOutput',
        outputs: [
            {
                internalType: 'uint256',
                name: 'amountIn',
                type: 'uint256'
            }
        ],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: 'address',
                        name: 'tokenIn',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'tokenOut',
                        type: 'address'
                    },
                    {
                        internalType: 'uint24',
                        name: 'fee',
                        type: 'uint24'
                    },
                    {
                        internalType: 'address',
                        name: 'recipient',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'amountOut',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'amountInMaximum',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint160',
                        name: 'sqrtPriceLimitX96',
                        type: 'uint160'
                    }
                ],
                internalType: 'struct IV3SwapRouter.ExactOutputSingleParams',
                name: 'params',
                type: 'tuple'
            }
        ],
        name: 'exactOutputSingle',
        outputs: [
            {
                internalType: 'uint256',
                name: 'amountIn',
                type: 'uint256'
            }
        ],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'bytes32',
                name: 'previousBlockhash',
                type: 'bytes32'
            },
            {
                internalType: 'bytes[]',
                name: 'data',
                type: 'bytes[]'
            }
        ],
        name: 'multicall',
        outputs: [
            {
                internalType: 'bytes[]',
                name: '',
                type: 'bytes[]'
            }
        ],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'deadline',
                type: 'uint256'
            },
            {
                internalType: 'bytes[]',
                name: 'data',
                type: 'bytes[]'
            }
        ],
        name: 'multicall',
        outputs: [
            {
                internalType: 'bytes[]',
                name: '',
                type: 'bytes[]'
            }
        ],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'bytes[]',
                name: 'data',
                type: 'bytes[]'
            }
        ],
        name: 'multicall',
        outputs: [
            {
                internalType: 'bytes[]',
                name: 'results',
                type: 'bytes[]'
            }
        ],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'amountMinimum',
                type: 'uint256'
            },
            {
                internalType: 'address',
                name: 'recipient',
                type: 'address'
            }
        ],
        name: 'unwrapWETH9',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'amountMinimum',
                type: 'uint256'
            }
        ],
        name: 'unwrapWETH9',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    }
];