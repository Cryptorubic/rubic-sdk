import { AbiItem } from 'web3-utils';

export const syncSwapAbi: AbiItem[] = [
    {
        inputs: [
            {
                components: [
                    {
                        components: [
                            {
                                internalType: 'address',
                                name: 'pool',
                                type: 'address'
                            },
                            {
                                internalType: 'bytes',
                                name: 'data',
                                type: 'bytes'
                            },
                            {
                                internalType: 'address',
                                name: 'callback',
                                type: 'address'
                            },
                            {
                                internalType: 'bytes',
                                name: 'callbackData',
                                type: 'bytes'
                            }
                        ],
                        internalType: 'struct IRouter.SwapStep[]',
                        name: 'steps',
                        type: 'tuple[]'
                    },
                    {
                        internalType: 'address',
                        name: 'tokenIn',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'amountIn',
                        type: 'uint256'
                    }
                ],
                internalType: 'struct IRouter.SwapPath[]',
                name: 'paths',
                type: 'tuple[]'
            },
            {
                internalType: 'uint256',
                name: 'amountOutMin',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'deadline',
                type: 'uint256'
            }
        ],
        name: 'swap',
        outputs: [
            {
                components: [
                    {
                        internalType: 'address',
                        name: 'token',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'amount',
                        type: 'uint256'
                    }
                ],
                internalType: 'struct IPool.TokenAmount',
                name: 'amountOut',
                type: 'tuple'
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
                        components: [
                            {
                                internalType: 'address',
                                name: 'pool',
                                type: 'address'
                            },
                            {
                                internalType: 'bytes',
                                name: 'data',
                                type: 'bytes'
                            },
                            {
                                internalType: 'address',
                                name: 'callback',
                                type: 'address'
                            },
                            {
                                internalType: 'bytes',
                                name: 'callbackData',
                                type: 'bytes'
                            }
                        ],
                        internalType: 'struct IRouter.SwapStep[]',
                        name: 'steps',
                        type: 'tuple[]'
                    },
                    {
                        internalType: 'address',
                        name: 'tokenIn',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'amountIn',
                        type: 'uint256'
                    }
                ],
                internalType: 'struct IRouter.SwapPath[]',
                name: 'paths',
                type: 'tuple[]'
            },
            {
                internalType: 'uint256',
                name: 'amountOutMin',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'deadline',
                type: 'uint256'
            },
            {
                components: [
                    {
                        internalType: 'address',
                        name: 'token',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'approveAmount',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'deadline',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint8',
                        name: 'v',
                        type: 'uint8'
                    },
                    {
                        internalType: 'bytes32',
                        name: 'r',
                        type: 'bytes32'
                    },
                    {
                        internalType: 'bytes32',
                        name: 's',
                        type: 'bytes32'
                    }
                ],
                internalType: 'struct IRouter.SplitPermitParams',
                name: 'permit',
                type: 'tuple'
            }
        ],
        name: 'swapWithPermit',
        outputs: [
            {
                components: [
                    {
                        internalType: 'address',
                        name: 'token',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'amount',
                        type: 'uint256'
                    }
                ],
                internalType: 'struct IPool.TokenAmount',
                name: 'amountOut',
                type: 'tuple'
            }
        ],
        stateMutability: 'payable',
        type: 'function'
    }
];
