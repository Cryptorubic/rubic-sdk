import { AbiItem } from 'web3-utils';

export const feeManagerAbi: AbiItem[] = [
    {
        inputs: [
            {
                internalType: 'address',
                name: '_mediator',
                type: 'address'
            },
            {
                internalType: 'address',
                name: '_owner',
                type: 'address'
            },
            {
                internalType: 'address[]',
                name: '_rewardAddresses',
                type: 'address[]'
            },
            {
                internalType: 'uint256[2]',
                name: '_fees',
                type: 'uint256[2]'
            }
        ],
        type: 'constructor'
    },
    {
        inputs: [],
        name: 'FOREIGN_TO_HOME_FEE',
        outputs: [
            {
                internalType: 'bytes32',
                name: '',
                type: 'bytes32'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'HOME_TO_FOREIGN_FEE',
        outputs: [
            {
                internalType: 'bytes32',
                name: '',
                type: 'bytes32'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_addr',
                type: 'address'
            }
        ],
        name: 'addRewardAddress',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'bytes32',
                name: '_feeType',
                type: 'bytes32'
            },
            {
                internalType: 'address',
                name: '_token',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: '_value',
                type: 'uint256'
            }
        ],
        name: 'calculateFee',
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
                name: '_token',
                type: 'address'
            }
        ],
        name: 'distributeFee',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'bytes32',
                name: '_feeType',
                type: 'bytes32'
            },
            {
                internalType: 'address',
                name: '_token',
                type: 'address'
            }
        ],
        name: 'getFee',
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
        name: 'getModuleInterfacesVersion',
        outputs: [
            {
                internalType: 'uint64',
                name: 'major',
                type: 'uint64'
            },
            {
                internalType: 'uint64',
                name: 'minor',
                type: 'uint64'
            },
            {
                internalType: 'uint64',
                name: 'patch',
                type: 'uint64'
            }
        ],
        stateMutability: 'pure',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_addr',
                type: 'address'
            }
        ],
        name: 'isRewardAddress',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'mediator',
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
        inputs: [],
        name: 'owner',
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
                name: '_addr',
                type: 'address'
            }
        ],
        name: 'removeRewardAddress',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'rewardAddressCount',
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
        name: 'rewardAddressList',
        outputs: [
            {
                internalType: 'address[]',
                name: '',
                type: 'address[]'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'bytes32',
                name: '_feeType',
                type: 'bytes32'
            },
            {
                internalType: 'address',
                name: '_token',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: '_fee',
                type: 'uint256'
            }
        ],
        name: 'setFee',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_newOwner',
                type: 'address'
            }
        ],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                name: 'feeType',
                type: 'bytes32'
            },
            {
                indexed: true,
                name: 'token',
                type: 'address'
            },
            {
                indexed: false,
                name: 'fee',
                type: 'uint256'
            }
        ],
        name: 'FeeUpdated',
        type: 'event'
    }
];
