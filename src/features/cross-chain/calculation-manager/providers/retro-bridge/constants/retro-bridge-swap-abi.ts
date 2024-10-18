import { AbiItem } from 'web3-utils';

export const retroBridgeSwapAbi: AbiItem[] = [
    {
        inputs: [
            { internalType: 'address', name: 'sender', type: 'address' },
            { internalType: 'contract IERC20', name: 'token', type: 'address' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' }
        ],
        name: 'transferToken',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: 'sender', type: 'address' }],
        name: 'transferEther',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    }
];
