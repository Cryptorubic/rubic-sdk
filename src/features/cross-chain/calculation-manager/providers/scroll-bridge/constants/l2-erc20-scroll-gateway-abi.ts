import { AbiItem } from 'web3-utils';

export const l2Erc20ScrollGatewayAbi: AbiItem[] = [
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [{ type: 'address', name: '', internalType: 'address' }],
        name: 'getL1ERC20Address',
        inputs: [{ type: 'address', name: '_l2Address', internalType: 'address' }]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'withdrawERC20',
        inputs: [
            { type: 'address', name: '_token', internalType: 'address' },
            { type: 'uint256', name: '_amount', internalType: 'uint256' },
            { type: 'uint256', name: '_gasLimit', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'withdrawERC20',
        inputs: [
            { type: 'address', name: '_token', internalType: 'address' },
            { type: 'address', name: '_to', internalType: 'address' },
            { type: 'uint256', name: '_amount', internalType: 'uint256' },
            { type: 'uint256', name: '_gasLimit', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'withdrawETH',
        inputs: [
            { type: 'address', name: '_to', internalType: 'address' },
            { type: 'uint256', name: '_amount', internalType: 'uint256' },
            { type: 'uint256', name: '_gasLimit', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'withdrawETH',
        inputs: [
            { type: 'uint256', name: '_amount', internalType: 'uint256' },
            { type: 'uint256', name: '_gasLimit', internalType: 'uint256' }
        ]
    }
];
