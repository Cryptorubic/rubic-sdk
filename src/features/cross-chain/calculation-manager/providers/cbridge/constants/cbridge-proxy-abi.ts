import { AbiItem } from 'web3-utils';

export const cbridgeProxyAbi: AbiItem[] = [
    {
        inputs: [
            { internalType: 'uint32', name: '_maxSlippage', type: 'uint32' },
            {
                components: [
                    { internalType: 'address', name: 'srcInputToken', type: 'address' },
                    { internalType: 'uint256', name: 'srcInputAmount', type: 'uint256' },
                    { internalType: 'uint256', name: 'dstChainID', type: 'uint256' },
                    { internalType: 'address', name: 'dstOutputToken', type: 'address' },
                    { internalType: 'uint256', name: 'dstMinOutputAmount', type: 'uint256' },
                    { internalType: 'address', name: 'recipient', type: 'address' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'address', name: 'router', type: 'address' }
                ],
                internalType: 'struct BridgeBase.BaseCrossChainParams',
                name: '_params',
                type: 'tuple'
            }
        ],
        name: 'bridge',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint32', name: '_maxSlippage', type: 'uint32' },
            {
                components: [
                    { internalType: 'address', name: 'srcInputToken', type: 'address' },
                    { internalType: 'uint256', name: 'srcInputAmount', type: 'uint256' },
                    { internalType: 'uint256', name: 'dstChainID', type: 'uint256' },
                    { internalType: 'address', name: 'dstOutputToken', type: 'address' },
                    { internalType: 'uint256', name: 'dstMinOutputAmount', type: 'uint256' },
                    { internalType: 'address', name: 'recipient', type: 'address' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'address', name: 'router', type: 'address' }
                ],
                internalType: 'struct BridgeBase.BaseCrossChainParams',
                name: '_params',
                type: 'tuple'
            }
        ],
        name: 'bridgeNative',
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
        inputs: [],
        name: 'paused',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_tokenOut', type: 'address' },
            { internalType: 'bytes', name: '_swapData', type: 'bytes' },
            { internalType: 'uint32', name: '_maxSlippage', type: 'uint32' },
            {
                components: [
                    { internalType: 'address', name: 'srcInputToken', type: 'address' },
                    { internalType: 'uint256', name: 'srcInputAmount', type: 'uint256' },
                    { internalType: 'uint256', name: 'dstChainID', type: 'uint256' },
                    { internalType: 'address', name: 'dstOutputToken', type: 'address' },
                    { internalType: 'uint256', name: 'dstMinOutputAmount', type: 'uint256' },
                    { internalType: 'address', name: 'recipient', type: 'address' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'address', name: 'router', type: 'address' }
                ],
                internalType: 'struct BridgeBase.BaseCrossChainParams',
                name: '_params',
                type: 'tuple'
            }
        ],
        name: 'swapAndBridge',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_tokenOut', type: 'address' },
            { internalType: 'bytes', name: '_swapData', type: 'bytes' },
            { internalType: 'uint32', name: '_maxSlippage', type: 'uint32' },
            {
                components: [
                    { internalType: 'address', name: 'srcInputToken', type: 'address' },
                    { internalType: 'uint256', name: 'srcInputAmount', type: 'uint256' },
                    { internalType: 'uint256', name: 'dstChainID', type: 'uint256' },
                    { internalType: 'address', name: 'dstOutputToken', type: 'address' },
                    { internalType: 'uint256', name: 'dstMinOutputAmount', type: 'uint256' },
                    { internalType: 'address', name: 'recipient', type: 'address' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'address', name: 'router', type: 'address' }
                ],
                internalType: 'struct BridgeBase.BaseCrossChainParams',
                name: '_params',
                type: 'tuple'
            }
        ],
        name: 'swapNativeAndBridge',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    }
];
