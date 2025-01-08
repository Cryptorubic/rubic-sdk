import { AbiItem } from 'web3-utils';

export const morphL1Erc20GatewayAbi: AbiItem[] = [
    {
        inputs: [
            { internalType: 'address', name: '_token', type: 'address' },
            { internalType: 'uint256', name: '_amount', type: 'uint256' },
            { internalType: 'uint256', name: '_gasLimit', type: 'uint256' }
        ],
        name: 'depositERC20',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_token', type: 'address' },
            { internalType: 'address', name: '_to', type: 'address' },
            { internalType: 'uint256', name: '_amount', type: 'uint256' },
            { internalType: 'uint256', name: '_gasLimit', type: 'uint256' }
        ],
        name: 'depositERC20',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: '_amount', type: 'uint256' },
            { internalType: 'uint256', name: '_gasLimit', type: 'uint256' }
        ],
        name: 'depositETH',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_to', type: 'address' },
            { internalType: 'uint256', name: '_amount', type: 'uint256' },
            { internalType: 'uint256', name: '_gasLimit', type: 'uint256' }
        ],
        name: 'depositETH',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'uint256', name: '', type: 'uint256' },
            { internalType: 'bytes', name: '', type: 'bytes' }
        ],
        name: 'finalizeWithdrawERC20',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'uint256', name: '', type: 'uint256' },
            { internalType: 'bytes', name: '', type: 'bytes' }
        ],
        name: 'finalizeWithdrawETH',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '_l1Address', type: 'address' }],
        name: 'getL2ERC20Address',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    }
];
