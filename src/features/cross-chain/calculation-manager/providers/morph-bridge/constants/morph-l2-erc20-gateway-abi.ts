import { AbiItem } from 'web3-utils';

export const morphL2Erc20GatewayAbi: AbiItem[] = [
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            },
            {
                internalType: 'address',
                name: '',
                type: 'address'
            },
            {
                internalType: 'address',
                name: '',
                type: 'address'
            },
            {
                internalType: 'address',
                name: '',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            },
            {
                internalType: 'bytes',
                name: '',
                type: 'bytes'
            }
        ],
        name: 'finalizeDepositERC20',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            },
            {
                internalType: 'address',
                name: '',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            },
            {
                internalType: 'bytes',
                name: '',
                type: 'bytes'
            }
        ],
        name: 'finalizeDepositETH',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_l2Address',
                type: 'address'
            }
        ],
        name: 'getL1ERC20Address',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_token',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_gasLimit',
                type: 'uint256'
            }
        ],
        name: 'withdrawERC20',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_token',
                type: 'address'
            },
            {
                internalType: 'address',
                name: '_to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_gasLimit',
                type: 'uint256'
            }
        ],
        name: 'withdrawERC20',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_gasLimit',
                type: 'uint256'
            }
        ],
        name: 'withdrawETH',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_gasLimit',
                type: 'uint256'
            }
        ],
        name: 'withdrawETH',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    }
];
