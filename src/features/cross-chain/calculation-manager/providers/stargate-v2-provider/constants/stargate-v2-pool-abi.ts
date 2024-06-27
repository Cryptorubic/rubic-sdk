import { AbiItem } from 'web3-utils';

export const stargateV2PoolAbi = [
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
] as AbiItem[];

export const stargateV2SendQuoteAbi = [
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
] as AbiItem[];
