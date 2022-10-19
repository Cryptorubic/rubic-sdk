import { AbiItem } from 'web3-utils';

export const multichainDexContractAbi = [
    {
        inputs: [
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
        name: 'multiBridge',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
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
        name: 'multiBridgeNative',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
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
            },
            { internalType: 'address', name: '_dex', type: 'address' },
            { internalType: 'address', name: '_tokenOut', type: 'address' },
            { internalType: 'bytes', name: '_swapData', type: 'bytes' }
        ],
        name: 'multiBridgeSwap',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
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
            },
            { internalType: 'address', name: '_dex', type: 'address' },
            { internalType: 'address', name: '_tokenOut', type: 'address' },
            { internalType: 'bytes', name: '_swapData', type: 'bytes' }
        ],
        name: 'multiBridgeSwapNative',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    }
] as AbiItem[];
