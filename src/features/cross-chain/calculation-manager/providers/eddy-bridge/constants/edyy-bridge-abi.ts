import { AbiItem } from 'web3-utils';

export const EDDY_BRIDGE_ABI = [
    {
        inputs: [],
        name: 'slippage',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'platformFee',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'bytes',
                name: 'withdrawData',
                type: 'bytes'
            },
            {
                internalType: 'address',
                name: 'zrc20',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'targetZRC20',
                type: 'address'
            }
        ],
        name: 'transferZetaToConnectedChain',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'bytes',
                name: 'withdrawData',
                type: 'bytes'
            },
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256'
            },
            {
                internalType: 'address',
                name: 'zrc20',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'targetZRC20',
                type: 'address'
            }
        ],
        name: 'withdrawToNativeChain',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    }
] as AbiItem[];

export const CUSTODY_ABI = [
    {
        inputs: [
            { internalType: 'bytes', name: 'recipient', type: 'bytes' },
            { internalType: 'contract IERC20', name: 'asset', type: 'address' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
            { internalType: 'bytes', name: 'message', type: 'bytes' }
        ],
        name: 'deposit',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    }
] as AbiItem[];
