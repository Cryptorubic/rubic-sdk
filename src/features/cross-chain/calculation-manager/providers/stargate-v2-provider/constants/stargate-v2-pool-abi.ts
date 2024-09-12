import { AbiItem } from 'web3-utils';

export const stargateV2PoolAbi: AbiItem[] = [
    {
        inputs: [
            {
                components: [
                    { internalType: 'uint32', name: 'dstEid', type: 'uint32' },
                    { internalType: 'bytes32', name: 'to', type: 'bytes32' },
                    { internalType: 'uint256', name: 'amountLD', type: 'uint256' },
                    { internalType: 'uint256', name: 'minAmountLD', type: 'uint256' },
                    { internalType: 'bytes', name: 'extraOptions', type: 'bytes' },
                    { internalType: 'bytes', name: 'composeMsg', type: 'bytes' },
                    { internalType: 'bytes', name: 'oftCmd', type: 'bytes' }
                ],
                internalType: 'struct SendParam',
                name: '_sendParam',
                type: 'tuple'
            }
        ],
        name: 'quoteOFT',
        outputs: [
            {
                components: [
                    { internalType: 'uint256', name: 'minAmountLD', type: 'uint256' },
                    { internalType: 'uint256', name: 'maxAmountLD', type: 'uint256' }
                ],
                internalType: 'struct OFTLimit',
                name: 'limit',
                type: 'tuple'
            },
            {
                components: [
                    { internalType: 'int256', name: 'feeAmountLD', type: 'int256' },
                    { internalType: 'string', name: 'description', type: 'string' }
                ],
                internalType: 'struct OFTFeeDetail[]',
                name: 'oftFeeDetails',
                type: 'tuple[]'
            },
            {
                components: [
                    { internalType: 'uint256', name: 'amountSentLD', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountReceivedLD', type: 'uint256' }
                ],
                internalType: 'struct OFTReceipt',
                name: 'receipt',
                type: 'tuple'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    }
];

export const stargateV2SendQuoteAbi: AbiItem[] = [
    {
        inputs: [
            {
                components: [
                    { internalType: 'uint32', name: 'dstEid', type: 'uint32' },
                    { internalType: 'bytes32', name: 'to', type: 'bytes32' },
                    { internalType: 'uint256', name: 'amountLD', type: 'uint256' },
                    { internalType: 'uint256', name: 'minAmountLD', type: 'uint256' },
                    { internalType: 'bytes', name: 'extraOptions', type: 'bytes' },
                    { internalType: 'bytes', name: 'composeMsg', type: 'bytes' },
                    { internalType: 'bytes', name: 'oftCmd', type: 'bytes' }
                ],
                internalType: 'struct SendParam',
                name: '_sendParam',
                type: 'tuple'
            },
            {
                internalType: 'bool',
                name: '_payInLzToken',
                type: 'bool'
            }
        ],
        name: 'quoteSend',
        outputs: [
            {
                components: [
                    { internalType: 'uint256', name: 'nativeFee', type: 'uint256' },
                    { internalType: 'uint256', name: 'lzTokenFee', type: 'uint256' }
                ],
                internalType: 'struct MessagingFee',
                name: 'fee',
                type: 'tuple'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    }
];

export const stargateV2SendTokenAbi: AbiItem[] = [
    {
        inputs: [
            {
                components: [
                    { internalType: 'uint32', name: 'dstEid', type: 'uint32' },
                    { internalType: 'bytes32', name: 'to', type: 'bytes32' },
                    { internalType: 'uint256', name: 'amountLD', type: 'uint256' },
                    { internalType: 'uint256', name: 'minAmountLD', type: 'uint256' },
                    { internalType: 'bytes', name: 'extraOptions', type: 'bytes' },
                    { internalType: 'bytes', name: 'composeMsg', type: 'bytes' },
                    { internalType: 'bytes', name: 'oftCmd', type: 'bytes' }
                ],
                internalType: 'struct SendParam',
                name: '_sendParam',
                type: 'tuple'
            },
            {
                components: [
                    { internalType: 'uint256', name: 'nativeFee', type: 'uint256' },
                    { internalType: 'uint256', name: 'lzTokenFee', type: 'uint256' }
                ],
                internalType: 'struct MessagingFee',
                name: '_fee',
                type: 'tuple'
            },
            { internalType: 'address', name: '_refundAddress', type: 'address' }
        ],
        name: 'sendToken',
        outputs: [
            {
                components: [
                    { internalType: 'bytes32', name: 'guid', type: 'bytes32' },
                    { internalType: 'uint64', name: 'nonce', type: 'uint64' },
                    {
                        components: [
                            { internalType: 'uint256', name: 'nativeFee', type: 'uint256' },
                            { internalType: 'uint256', name: 'lzTokenFee', type: 'uint256' }
                        ],
                        internalType: 'struct MessagingFee',
                        name: 'fee',
                        type: 'tuple'
                    }
                ],
                internalType: 'struct MessagingReceipt',
                name: 'msgReceipt',
                type: 'tuple'
            },
            {
                components: [
                    { internalType: 'uint256', name: 'amountSentLD', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountReceivedLD', type: 'uint256' }
                ],
                internalType: 'struct OFTReceipt',
                name: 'oftReceipt',
                type: 'tuple'
            },
            {
                components: [
                    { internalType: 'uint72', name: 'ticketId', type: 'uint72' },
                    { internalType: 'bytes', name: 'passengerBytes', type: 'bytes' }
                ],
                internalType: 'struct Ticket',
                name: 'ticket',
                type: 'tuple'
            }
        ],
        stateMutability: 'payable',
        type: 'function'
    }
];

export const stargateV2PoolBalanceAbi: AbiItem[] = [
    {
        inputs: [],
        name: 'poolBalance',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    }
];
