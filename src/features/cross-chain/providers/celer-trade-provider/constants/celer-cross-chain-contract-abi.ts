import { AbiItem } from 'web3-utils';

export const celerCrossChainContractAbi: AbiItem[] = [
    {
        inputs: [],
        name: 'RubicPlatformFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'messageBus',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'blockchainToGasFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_receiver', type: 'address' },
            { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
            { internalType: 'uint64', name: '_dstChainId', type: 'uint64' },
            { internalType: 'address', name: '_srcBridgeToken', type: 'address' },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'bool', name: 'nativeOut', type: 'bool' },
                    { internalType: 'address', name: 'receiverEOA', type: 'address' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'enum SwapBase.SwapVersion', name: 'version', type: 'uint8' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'bytes', name: 'pathV3', type: 'bytes' },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoDest',
                name: '_dstSwap',
                type: 'tuple'
            },
            { internalType: 'uint32', name: '_maxBridgeSlippage', type: 'uint32' }
        ],
        name: 'bridgeWithSwap',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_receiver', type: 'address' },
            { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
            { internalType: 'uint64', name: '_dstChainId', type: 'uint64' },
            { internalType: 'address', name: '_srcBridgeToken', type: 'address' },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'bool', name: 'nativeOut', type: 'bool' },
                    { internalType: 'address', name: 'receiverEOA', type: 'address' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'enum SwapBase.SwapVersion', name: 'version', type: 'uint8' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'bytes', name: 'pathV3', type: 'bytes' },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoDest',
                name: '_dstSwap',
                type: 'tuple'
            },
            { internalType: 'uint32', name: '_maxBridgeSlippage', type: 'uint32' }
        ],
        name: 'bridgeWithSwapNative',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'fixedCryptoFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'integratorToFeeInfo',
        outputs: [
            { internalType: 'bool', name: 'isIntegrator', type: 'bool' },
            { internalType: 'uint32', name: 'tokenFee', type: 'uint32' },
            { internalType: 'uint32', name: 'RubicTokenShare', type: 'uint32' },
            { internalType: 'uint32', name: 'RubicFixedCryptoShare', type: 'uint32' },
            { internalType: 'uint128', name: 'fixedFeeAmount', type: 'uint128' }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'maxTokenAmount',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'minTokenAmount',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'nativeWrap',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'paused',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_receiver', type: 'address' },
            { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
            { internalType: 'uint64', name: '_dstChainId', type: 'uint64' },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'bytes', name: 'data', type: 'bytes' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoInch',
                name: '_srcSwap',
                type: 'tuple'
            },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'bool', name: 'nativeOut', type: 'bool' },
                    { internalType: 'address', name: 'receiverEOA', type: 'address' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'enum SwapBase.SwapVersion', name: 'version', type: 'uint8' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'bytes', name: 'pathV3', type: 'bytes' },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoDest',
                name: '_dstSwap',
                type: 'tuple'
            },
            { internalType: 'uint32', name: '_maxBridgeSlippage', type: 'uint32' }
        ],
        name: 'transferWithSwapInch',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_receiver', type: 'address' },
            { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
            { internalType: 'uint64', name: '_dstChainId', type: 'uint64' },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'bytes', name: 'data', type: 'bytes' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoInch',
                name: '_srcSwap',
                type: 'tuple'
            },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'bool', name: 'nativeOut', type: 'bool' },
                    { internalType: 'address', name: 'receiverEOA', type: 'address' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'enum SwapBase.SwapVersion', name: 'version', type: 'uint8' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'bytes', name: 'pathV3', type: 'bytes' },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoDest',
                name: '_dstSwap',
                type: 'tuple'
            },
            { internalType: 'uint32', name: '_maxBridgeSlippage', type: 'uint32' }
        ],
        name: 'transferWithSwapInchNative',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_receiver', type: 'address' },
            { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
            { internalType: 'uint64', name: '_dstChainId', type: 'uint64' },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoV2',
                name: '_srcSwap',
                type: 'tuple'
            },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'bool', name: 'nativeOut', type: 'bool' },
                    { internalType: 'address', name: 'receiverEOA', type: 'address' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'enum SwapBase.SwapVersion', name: 'version', type: 'uint8' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'bytes', name: 'pathV3', type: 'bytes' },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoDest',
                name: '_dstSwap',
                type: 'tuple'
            },
            { internalType: 'uint32', name: '_maxBridgeSlippage', type: 'uint32' }
        ],
        name: 'transferWithSwapV2',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_receiver', type: 'address' },
            { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
            { internalType: 'uint64', name: '_dstChainId', type: 'uint64' },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoV2',
                name: '_srcSwap',
                type: 'tuple'
            },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'bool', name: 'nativeOut', type: 'bool' },
                    { internalType: 'address', name: 'receiverEOA', type: 'address' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'enum SwapBase.SwapVersion', name: 'version', type: 'uint8' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'bytes', name: 'pathV3', type: 'bytes' },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoDest',
                name: '_dstSwap',
                type: 'tuple'
            },
            { internalType: 'uint32', name: '_maxBridgeSlippage', type: 'uint32' }
        ],
        name: 'transferWithSwapV2Native',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_receiver', type: 'address' },
            { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
            { internalType: 'uint64', name: '_dstChainId', type: 'uint64' },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'bytes', name: 'path', type: 'bytes' },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoV3',
                name: '_srcSwap',
                type: 'tuple'
            },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'bool', name: 'nativeOut', type: 'bool' },
                    { internalType: 'address', name: 'receiverEOA', type: 'address' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'enum SwapBase.SwapVersion', name: 'version', type: 'uint8' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'bytes', name: 'pathV3', type: 'bytes' },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoDest',
                name: '_dstSwap',
                type: 'tuple'
            },
            { internalType: 'uint32', name: '_maxBridgeSlippage', type: 'uint32' }
        ],
        name: 'transferWithSwapV3',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_receiver', type: 'address' },
            { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
            { internalType: 'uint64', name: '_dstChainId', type: 'uint64' },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'bytes', name: 'path', type: 'bytes' },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoV3',
                name: '_srcSwap',
                type: 'tuple'
            },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'bool', name: 'nativeOut', type: 'bool' },
                    { internalType: 'address', name: 'receiverEOA', type: 'address' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'enum SwapBase.SwapVersion', name: 'version', type: 'uint8' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'bytes', name: 'pathV3', type: 'bytes' },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoDest',
                name: '_dstSwap',
                type: 'tuple'
            },
            { internalType: 'uint32', name: '_maxBridgeSlippage', type: 'uint32' }
        ],
        name: 'transferWithSwapV3Native',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
        name: 'processedTransactions',
        outputs: [
            {
                internalType: 'enum WithDestinationFunctionality.SwapStatus',
                name: '',
                type: 'uint8'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    }
];
