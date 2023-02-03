import { AbiItem } from 'web3-utils';

export const evmCommonCrossChainAbi: AbiItem[] = [
    {
        inputs: [],
        name: 'fixedNativeFee',
        outputs: [
            {
                internalType: 'uint256',
                name: '_fixedNativeFee',
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
                name: '_integrator',
                type: 'address'
            }
        ],
        name: 'integratorToFeeInfo',
        outputs: [
            {
                components: [
                    {
                        internalType: 'bool',
                        name: 'isIntegrator',
                        type: 'bool'
                    },
                    {
                        internalType: 'uint32',
                        name: 'tokenFee',
                        type: 'uint32'
                    },
                    {
                        internalType: 'uint32',
                        name: 'RubicTokenShare',
                        type: 'uint32'
                    },
                    {
                        internalType: 'uint32',
                        name: 'RubicFixedCryptoShare',
                        type: 'uint32'
                    },
                    {
                        internalType: 'uint128',
                        name: 'fixedFeeAmount',
                        type: 'uint128'
                    }
                ],
                internalType: 'struct IFeesFacet.IntegratorFeeInfo',
                name: '_info',
                type: 'tuple'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'RubicPlatformFee',
        outputs: [
            {
                internalType: 'uint256',
                name: '_RubicPlatformFee',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: 'bytes32',
                        name: 'transactionId',
                        type: 'bytes32'
                    },
                    {
                        internalType: 'string',
                        name: 'bridge',
                        type: 'string'
                    },
                    {
                        internalType: 'address',
                        name: 'integrator',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'referrer',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'sendingAssetId',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'receiver',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'minAmount',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'destinationChainId',
                        type: 'uint256'
                    },
                    {
                        internalType: 'bool',
                        name: 'hasSourceSwaps',
                        type: 'bool'
                    },
                    {
                        internalType: 'bool',
                        name: 'hasDestinationCall',
                        type: 'bool'
                    }
                ],
                internalType: 'struct IRubic.BridgeData',
                name: '_bridgeData',
                type: 'tuple'
            },
            {
                components: [
                    {
                        internalType: 'bytes',
                        name: 'firstSwapCalldata',
                        type: 'bytes'
                    },
                    {
                        internalType: 'bytes',
                        name: 'secondSwapCalldata',
                        type: 'bytes'
                    },
                    {
                        internalType: 'address',
                        name: 'intermediateToken',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'bridgingToken',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'firstDexRouter',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'secondDexRouter',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'relayRecipient',
                        type: 'address'
                    },
                    {
                        internalType: 'bytes',
                        name: 'otherSideCalldata',
                        type: 'bytes'
                    }
                ],
                internalType: 'struct SymbiosisFacet.SymbiosisData',
                name: '_symbiosisData',
                type: 'tuple'
            }
        ],
        name: 'startBridgeTokensViaSymbiosis',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                components: [
                    { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
                    { internalType: 'string', name: 'bridge', type: 'string' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'address', name: 'referrer', type: 'address' },
                    { internalType: 'address', name: 'sendingAssetId', type: 'address' },
                    { internalType: 'address', name: 'receiver', type: 'address' },
                    { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
                    { internalType: 'uint256', name: 'destinationChainId', type: 'uint256' },
                    { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
                    { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' }
                ],
                internalType: 'struct IRubic.BridgeData',
                name: '_bridgeData',
                type: 'tuple'
            },
            {
                components: [
                    { internalType: 'address', name: 'callTo', type: 'address' },
                    { internalType: 'address', name: 'approveTo', type: 'address' },
                    { internalType: 'address', name: 'sendingAssetId', type: 'address' },
                    { internalType: 'address', name: 'receivingAssetId', type: 'address' },
                    { internalType: 'uint256', name: 'fromAmount', type: 'uint256' },
                    { internalType: 'bytes', name: 'callData', type: 'bytes' },
                    { internalType: 'bool', name: 'requiresDeposit', type: 'bool' }
                ],
                internalType: 'struct LibSwap.SwapData[]',
                name: '_swapData',
                type: 'tuple[]'
            },
            {
                components: [
                    { internalType: 'bytes', name: 'firstSwapCalldata', type: 'bytes' },
                    { internalType: 'bytes', name: 'secondSwapCalldata', type: 'bytes' },
                    { internalType: 'address', name: 'intermediateToken', type: 'address' },
                    { internalType: 'address', name: 'bridgingToken', type: 'address' },
                    { internalType: 'address', name: 'firstDexRouter', type: 'address' },
                    { internalType: 'address', name: 'secondDexRouter', type: 'address' },
                    { internalType: 'address', name: 'relayRecipient', type: 'address' },
                    { internalType: 'bytes', name: 'otherSideCalldata', type: 'bytes' }
                ],
                internalType: 'struct SymbiosisFacet.SymbiosisData',
                name: '_symbiosisData',
                type: 'tuple'
            }
        ],
        name: 'swapAndStartBridgeTokensViaSymbiosis',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                components: [
                    { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
                    { internalType: 'string', name: 'bridge', type: 'string' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'address', name: 'referrer', type: 'address' },
                    { internalType: 'address', name: 'sendingAssetId', type: 'address' },
                    { internalType: 'address', name: 'receiver', type: 'address' },
                    { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
                    { internalType: 'uint256', name: 'destinationChainId', type: 'uint256' },
                    { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
                    { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' }
                ],
                internalType: 'struct IRubic.BridgeData',
                name: '_bridgeData',
                type: 'tuple'
            },
            {
                components: [
                    { internalType: 'address', name: 'callTo', type: 'address' },
                    { internalType: 'address', name: 'approveTo', type: 'address' },
                    { internalType: 'address', name: 'sendingAssetId', type: 'address' },
                    { internalType: 'address', name: 'receivingAssetId', type: 'address' },
                    { internalType: 'uint256', name: 'fromAmount', type: 'uint256' },
                    { internalType: 'bytes', name: 'callData', type: 'bytes' },
                    { internalType: 'bool', name: 'requiresDeposit', type: 'bool' }
                ],
                internalType: 'struct LibSwap.SwapData[]',
                name: '_swapData',
                type: 'tuple[]'
            },
            {
                components: [{ internalType: 'address', name: 'router', type: 'address' }],
                internalType: 'struct MultichainFacet.MultichainData',
                name: '_multichainData',
                type: 'tuple'
            }
        ],
        name: 'swapAndStartBridgeTokensViaMultichain',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: 'anyNative', type: 'address' },
            { internalType: 'address[]', name: 'routers', type: 'address[]' }
        ],
        name: 'initMultichain',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address[]', name: 'routers', type: 'address[]' },
            { internalType: 'bool[]', name: 'allowed', type: 'bool[]' }
        ],
        name: 'registerRouters',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                components: [
                    { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
                    { internalType: 'string', name: 'bridge', type: 'string' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'address', name: 'referrer', type: 'address' },
                    { internalType: 'address', name: 'sendingAssetId', type: 'address' },
                    { internalType: 'address', name: 'receiver', type: 'address' },
                    { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
                    { internalType: 'uint256', name: 'destinationChainId', type: 'uint256' },
                    { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
                    { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' }
                ],
                internalType: 'struct IRubic.BridgeData',
                name: '_bridgeData',
                type: 'tuple'
            },
            {
                components: [{ internalType: 'address', name: 'router', type: 'address' }],
                internalType: 'struct MultichainFacet.MultichainData',
                name: '_multichainData',
                type: 'tuple'
            }
        ],
        name: 'startBridgeTokensViaMultichain',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    }
];
