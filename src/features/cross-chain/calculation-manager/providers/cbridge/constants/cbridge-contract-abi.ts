import { AbiItem } from 'web3-utils';

export const cbridgeContractAbi: AbiItem[] = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'bytes32',
                name: 'transferId',
                type: 'bytes32'
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'sender',
                type: 'address'
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'receiver',
                type: 'address'
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'token',
                type: 'address'
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256'
            },
            {
                indexed: false,
                internalType: 'uint64',
                name: 'dstChainId',
                type: 'uint64'
            },
            {
                indexed: false,
                internalType: 'uint64',
                name: 'nonce',
                type: 'uint64'
            },
            {
                indexed: false,
                internalType: 'uint32',
                name: 'maxSlippage',
                type: 'uint32'
            }
        ],
        name: 'Send',
        type: 'event'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        name: 'maxSend',
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
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        name: 'minSend',
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
                internalType: 'address',
                name: '_receiver',
                type: 'address'
            },
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
                internalType: 'uint64',
                name: '_dstChainId',
                type: 'uint64'
            },
            {
                internalType: 'uint64',
                name: '_nonce',
                type: 'uint64'
            },
            {
                internalType: 'uint32',
                name: '_maxSlippage',
                type: 'uint32'
            }
        ],
        name: 'send',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_receiver',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256'
            },
            {
                internalType: 'uint64',
                name: '_dstChainId',
                type: 'uint64'
            },
            {
                internalType: 'uint64',
                name: '_nonce',
                type: 'uint64'
            },
            {
                internalType: 'uint32',
                name: '_maxSlippage',
                type: 'uint32'
            }
        ],
        name: 'sendNative',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'bytes',
                name: '_wdmsg',
                type: 'bytes'
            },
            {
                internalType: 'bytes[]',
                name: '_sigs',
                type: 'bytes[]'
            },
            {
                internalType: 'address[]',
                name: '_signers',
                type: 'address[]'
            },
            {
                internalType: 'uint256[]',
                name: '_powers',
                type: 'uint256[]'
            }
        ],
        name: 'withdraw',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    }
];
