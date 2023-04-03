import { AbiItem } from 'web3-utils';

export const stargateRouterAbi = [
    {
        inputs: [
            { internalType: 'uint16', name: '_dstChainId', type: 'uint16' },
            { internalType: 'uint8', name: '_functionType', type: 'uint8' },
            { internalType: 'bytes', name: '_toAddress', type: 'bytes' },
            { internalType: 'bytes', name: '_transferAndCallPayload', type: 'bytes' },
            {
                components: [
                    { internalType: 'uint256', name: 'dstGasForCall', type: 'uint256' },
                    { internalType: 'uint256', name: 'dstNativeAmount', type: 'uint256' },
                    { internalType: 'bytes', name: 'dstNativeAddr', type: 'bytes' }
                ],
                internalType: 'struct IStargateRouter.lzTxObj',
                name: '_lzTxParams',
                type: 'tuple'
            }
        ],
        name: 'quoteLayerZeroFee',
        outputs: [
            { internalType: 'uint256', name: '', type: 'uint256' },
            { internalType: 'uint256', name: '', type: 'uint256' }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint16', name: '_dstChainId', type: 'uint16' },
            { internalType: 'uint256', name: '_srcPoolId', type: 'uint256' },
            { internalType: 'uint256', name: '_dstPoolId', type: 'uint256' },
            { internalType: 'address payable', name: '_refundAddress', type: 'address' },
            { internalType: 'uint256', name: '_amountLD', type: 'uint256' },
            { internalType: 'uint256', name: '_minAmountLD', type: 'uint256' },
            {
                components: [
                    { internalType: 'uint256', name: 'dstGasForCall', type: 'uint256' },
                    { internalType: 'uint256', name: 'dstNativeAmount', type: 'uint256' },
                    { internalType: 'bytes', name: 'dstNativeAddr', type: 'bytes' }
                ],
                internalType: 'struct IStargateRouter.lzTxObj',
                name: '_lzTxParams',
                type: 'tuple'
            },
            { internalType: 'bytes', name: '_to', type: 'bytes' },
            { internalType: 'bytes', name: '_payload', type: 'bytes' }
        ],
        name: 'swap',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'factory',
        outputs: [{ internalType: 'contract Factory', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    }
] as AbiItem[];
