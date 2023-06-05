import { AbiItem } from 'web3-utils';

export const l1Erc20GatewayAbi: AbiItem[] = [
    {
        inputs: [
            { internalType: 'address', name: '_l1Token', type: 'address' },
            { internalType: 'address', name: '_to', type: 'address' },
            { internalType: 'uint256', name: '_amount', type: 'uint256' },
            { internalType: 'uint256', name: '_maxGas', type: 'uint256' },
            { internalType: 'uint256', name: '_gasPriceBid', type: 'uint256' },
            { internalType: 'bytes', name: '_data', type: 'bytes' }
        ],
        name: 'outboundTransfer',
        outputs: [{ internalType: 'bytes', name: 'res', type: 'bytes' }],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_l1Token', type: 'address' },
            { internalType: 'address', name: '_refundTo', type: 'address' },
            { internalType: 'address', name: '_to', type: 'address' },
            { internalType: 'uint256', name: '_amount', type: 'uint256' },
            { internalType: 'uint256', name: '_maxGas', type: 'uint256' },
            { internalType: 'uint256', name: '_gasPriceBid', type: 'uint256' },
            { internalType: 'bytes', name: '_data', type: 'bytes' }
        ],
        name: 'outboundTransferCustomRefund',
        outputs: [{ internalType: 'bytes', name: 'res', type: 'bytes' }],
        stateMutability: 'payable',
        type: 'function'
    }
];
