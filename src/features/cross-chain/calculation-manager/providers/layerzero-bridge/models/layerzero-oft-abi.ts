import { AbiItem } from 'web3-utils';

export const layerZeroOFTABI: AbiItem[] = [
    {
        inputs: [
            {
                internalType: 'uint16',
                name: '_dstChainId',
                type: 'uint16'
            },
            {
                internalType: 'bytes',
                name: '_toAddress',
                type: 'bytes'
            },
            {
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256'
            },
            {
                internalType: 'bool',
                name: '_useZro',
                type: 'bool'
            },
            {
                internalType: 'bytes',
                name: '_adapterParams',
                type: 'bytes'
            }
        ],
        name: 'estimateSendFee',
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
                internalType: 'address',
                name: '_from',
                type: 'address'
            },
            {
                internalType: 'uint16',
                name: '_dstChainId',
                type: 'uint16'
            },
            {
                internalType: 'bytes',
                name: '_toAddress',
                type: 'bytes'
            },
            {
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256'
            },
            {
                internalType: 'address payable',
                name: '_refundAddress',
                type: 'address'
            },
            {
                internalType: 'address',
                name: '_zroPaymentAddress',
                type: 'address'
            },
            {
                internalType: 'bytes',
                name: '_adapterParams',
                type: 'bytes'
            }
        ],
        name: 'sendFrom',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    }
];
