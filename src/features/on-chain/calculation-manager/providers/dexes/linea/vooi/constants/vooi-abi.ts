import { AbiItem } from 'web3-utils';

export const vooiAbi: AbiItem[] = [
    {
        inputs: [
            { internalType: 'uint256', name: '_fromID', type: 'uint256' },
            { internalType: 'uint256', name: '_toID', type: 'uint256' },
            { internalType: 'uint256', name: '_fromAmount', type: 'uint256' },
            { internalType: 'uint256', name: '_minToAmount', type: 'uint256' },
            { internalType: 'address', name: '_to', type: 'address' },
            { internalType: 'uint256', name: '_deadline', type: 'uint256' }
        ],
        name: 'swap',
        outputs: [
            { internalType: 'uint256', name: 'actualToAmount', type: 'uint256' },
            { internalType: 'uint256', name: 'lpFeeAmount', type: 'uint256' }
        ],
        stateMutability: 'nonpayable',
        type: 'function'
    }
];
