import { AbiItem } from 'web3-utils';

export const archonBridgeAbi: AbiItem[] = [
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        name: 'LDtoSDConversionRate',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'PT_MINT',
        outputs: [
            {
                internalType: 'uint8',
                name: '',
                type: 'uint8'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'PT_UNLOCK',
        outputs: [
            {
                internalType: 'uint8',
                name: '',
                type: 'uint8'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'TOTAL_BPS',
        outputs: [
            {
                internalType: 'uint16',
                name: '',
                type: 'uint16'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'token',
                type: 'address'
            }
        ],
        name: 'accruedFeeLD',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'automaticFeesTransfer',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'token',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'amountLD',
                type: 'uint256'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                components: [
                    {
                        internalType: 'address payable',
                        name: 'refundAddress',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'zroPaymentAddress',
                        type: 'address'
                    }
                ],
                internalType: 'struct LzLib.CallParams',
                name: 'callParams',
                type: 'tuple'
            },
            {
                internalType: 'bytes',
                name: 'adapterParams',
                type: 'bytes'
            }
        ],
        name: 'bridge',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'amountLD',
                type: 'uint256'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                components: [
                    {
                        internalType: 'address payable',
                        name: 'refundAddress',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'zroPaymentAddress',
                        type: 'address'
                    }
                ],
                internalType: 'struct LzLib.CallParams',
                name: 'callParams',
                type: 'tuple'
            },
            {
                internalType: 'bytes',
                name: 'adapterParams',
                type: 'bytes'
            }
        ],
        name: 'bridgeNative',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'depositFeeBps',
        outputs: [
            {
                internalType: 'uint16',
                name: '',
                type: 'uint16'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'bool',
                name: 'useZro',
                type: 'bool'
            },
            {
                internalType: 'bytes',
                name: 'adapterParams',
                type: 'bytes'
            }
        ],
        name: 'estimateBridgeFee',
        outputs: [
            {
                internalType: 'uint256',
                name: 'nativeFee',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'zroFee',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '',
                type: 'uint16'
            },
            {
                internalType: 'bytes',
                name: '',
                type: 'bytes'
            },
            {
                internalType: 'uint64',
                name: '',
                type: 'uint64'
            }
        ],
        name: 'failedMessages',
        outputs: [
            {
                internalType: 'bytes32',
                name: '',
                type: 'bytes32'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'feeReceiver',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_srcChainId',
                type: 'uint16'
            },
            {
                internalType: 'bytes',
                name: '_srcAddress',
                type: 'bytes'
            }
        ],
        name: 'forceResumeReceive',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_version',
                type: 'uint16'
            },
            {
                internalType: 'uint16',
                name: '_chainId',
                type: 'uint16'
            },
            {
                internalType: 'address',
                name: '',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: '_configType',
                type: 'uint256'
            }
        ],
        name: 'getConfig',
        outputs: [
            {
                internalType: 'bytes',
                name: '',
                type: 'bytes'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_remoteChainId',
                type: 'uint16'
            }
        ],
        name: 'getTrustedRemoteAddress',
        outputs: [
            {
                internalType: 'bytes',
                name: '',
                type: 'bytes'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_srcChainId',
                type: 'uint16'
            },
            {
                internalType: 'bytes',
                name: '_srcAddress',
                type: 'bytes'
            }
        ],
        name: 'isTrustedRemote',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'lzEndpoint',
        outputs: [
            {
                internalType: 'contract ILayerZeroEndpoint',
                name: '',
                type: 'address'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_srcChainId',
                type: 'uint16'
            },
            {
                internalType: 'bytes',
                name: '_srcAddress',
                type: 'bytes'
            },
            {
                internalType: 'uint64',
                name: '_nonce',
                type: 'uint64'
            },
            {
                internalType: 'bytes',
                name: '_payload',
                type: 'bytes'
            }
        ],
        name: 'lzReceive',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '',
                type: 'uint16'
            },
            {
                internalType: 'uint16',
                name: '',
                type: 'uint16'
            }
        ],
        name: 'minDstGasLookup',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_srcChainId',
                type: 'uint16'
            },
            {
                internalType: 'bytes',
                name: '_srcAddress',
                type: 'bytes'
            },
            {
                internalType: 'uint64',
                name: '_nonce',
                type: 'uint64'
            },
            {
                internalType: 'bytes',
                name: '_payload',
                type: 'bytes'
            }
        ],
        name: 'nonblockingLzReceive',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'owner',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'precrime',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'token',
                type: 'address'
            },
            {
                internalType: 'uint8',
                name: 'sharedDecimals',
                type: 'uint8'
            }
        ],
        name: 'registerToken',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'remoteChainId',
        outputs: [
            {
                internalType: 'uint16',
                name: '',
                type: 'uint16'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'renounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_srcChainId',
                type: 'uint16'
            },
            {
                internalType: 'bytes',
                name: '_srcAddress',
                type: 'bytes'
            },
            {
                internalType: 'uint64',
                name: '_nonce',
                type: 'uint64'
            },
            {
                internalType: 'bytes',
                name: '_payload',
                type: 'bytes'
            }
        ],
        name: 'retryMessage',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_version',
                type: 'uint16'
            },
            {
                internalType: 'uint16',
                name: '_chainId',
                type: 'uint16'
            },
            {
                internalType: 'uint256',
                name: '_configType',
                type: 'uint256'
            },
            {
                internalType: 'bytes',
                name: '_config',
                type: 'bytes'
            }
        ],
        name: 'setConfig',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_depositFeeBps',
                type: 'uint16'
            }
        ],
        name: 'setDepositFeeBps',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_feeReceiver',
                type: 'address'
            },
            {
                internalType: 'bool',
                name: '_automaticFeesTransfer',
                type: 'bool'
            }
        ],
        name: 'setFeeReceiver',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_dstChainId',
                type: 'uint16'
            },
            {
                internalType: 'uint16',
                name: '_packetType',
                type: 'uint16'
            },
            {
                internalType: 'uint256',
                name: '_minGas',
                type: 'uint256'
            }
        ],
        name: 'setMinDstGas',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_precrime',
                type: 'address'
            }
        ],
        name: 'setPrecrime',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_version',
                type: 'uint16'
            }
        ],
        name: 'setReceiveVersion',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_remoteChainId',
                type: 'uint16'
            }
        ],
        name: 'setRemoteChainId',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_version',
                type: 'uint16'
            }
        ],
        name: 'setSendVersion',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_srcChainId',
                type: 'uint16'
            },
            {
                internalType: 'bytes',
                name: '_path',
                type: 'bytes'
            }
        ],
        name: 'setTrustedRemote',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_remoteChainId',
                type: 'uint16'
            },
            {
                internalType: 'bytes',
                name: '_remoteAddress',
                type: 'bytes'
            }
        ],
        name: 'setTrustedRemoteAddress',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'bool',
                name: '_useCustomAdapterParams',
                type: 'bool'
            }
        ],
        name: 'setUseCustomAdapterParams',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        name: 'supportedTokens',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        name: 'totalValueLockedSD',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'newOwner',
                type: 'address'
            }
        ],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '',
                type: 'uint16'
            }
        ],
        name: 'trustedRemoteLookup',
        outputs: [
            {
                internalType: 'bytes',
                name: '',
                type: 'bytes'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'token',
                type: 'address'
            }
        ],
        name: 'unregisterToken',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'useCustomAdapterParams',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'weth',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'token',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'amountLD',
                type: 'uint256'
            }
        ],
        name: 'withdrawFee',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        stateMutability: 'payable',
        type: 'receive'
    }
];
