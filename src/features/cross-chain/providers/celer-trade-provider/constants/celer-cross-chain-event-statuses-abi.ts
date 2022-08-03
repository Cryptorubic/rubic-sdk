import { AbiItem } from 'web3-utils';

export const celerCrossChainEventStatusesAbi: AbiItem[] = [
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
            { indexed: false, internalType: 'uint64', name: 'dstChainId', type: 'uint64' },
            { indexed: false, internalType: 'uint256', name: 'srcAmount', type: 'uint256' },
            { indexed: false, internalType: 'address', name: 'srcToken', type: 'address' }
        ],
        name: 'BridgeRequestSent',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
            { indexed: false, internalType: 'uint256', name: 'dstAmount', type: 'uint256' },
            {
                indexed: false,
                internalType: 'enum SwapBase.SwapStatus',
                name: 'status',
                type: 'uint8'
            }
        ],
        name: 'SwapRequestDone',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
            { indexed: false, internalType: 'uint64', name: 'dstChainId', type: 'uint64' },
            { indexed: false, internalType: 'uint256', name: 'srcAmount', type: 'uint256' },
            { indexed: false, internalType: 'address', name: 'srcToken', type: 'address' }
        ],
        name: 'SwapRequestSentInch',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
            { indexed: false, internalType: 'uint64', name: 'dstChainId', type: 'uint64' },
            { indexed: false, internalType: 'uint256', name: 'srcAmount', type: 'uint256' },
            { indexed: false, internalType: 'address', name: 'srcToken', type: 'address' }
        ],
        name: 'SwapRequestSentV2',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
            { indexed: false, internalType: 'uint64', name: 'dstChainId', type: 'uint64' },
            { indexed: false, internalType: 'uint256', name: 'srcAmount', type: 'uint256' },
            { indexed: false, internalType: 'address', name: 'srcToken', type: 'address' }
        ],
        name: 'SwapRequestSentV3',
        type: 'event'
    }
];
