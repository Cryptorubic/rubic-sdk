import { AbiItem } from 'web3-utils';

export const erc677Abi: AbiItem[] = [
    {
        inputs: [
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
            { internalType: 'bytes', name: '', type: 'bytes' }
        ],
        name: 'transferAndCall',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function'
    }
];
