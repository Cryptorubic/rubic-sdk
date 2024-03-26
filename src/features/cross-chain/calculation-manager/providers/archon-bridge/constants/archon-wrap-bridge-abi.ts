import { AbiItem } from 'web3-utils';

export const archonWrapBridgeAbi: AbiItem[] = [
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'bridge',
        inputs: [
            { type: 'address', name: 'localToken', internalType: 'address' },
            { type: 'uint16', name: 'remoteChainId', internalType: 'uint16' },
            { type: 'uint256', name: 'amount', internalType: 'uint256' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'bool', name: 'unwrapWeth', internalType: 'bool' },
            {
                type: 'tuple',
                name: 'callParams',
                internalType: 'struct LzLib.CallParams',
                components: [
                    { type: 'address', name: 'refundAddress', internalType: 'address payable' },
                    { type: 'address', name: 'zroPaymentAddress', internalType: 'address' }
                ]
            },
            { type: 'bytes', name: 'adapterParams', internalType: 'bytes' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [
            { type: 'uint256', name: 'nativeFee', internalType: 'uint256' },
            { type: 'uint256', name: 'zroFee', internalType: 'uint256' }
        ],
        name: 'estimateBridgeFee',
        inputs: [
            { type: 'uint16', name: 'remoteChainId', internalType: 'uint16' },
            { type: 'bool', name: 'useZro', internalType: 'bool' },
            { type: 'bytes', name: 'adapterParams', internalType: 'bytes' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [{ type: 'uint16', name: '', internalType: 'uint16' }],
        name: 'withdrawalFeeBps',
        inputs: []
    }
];
