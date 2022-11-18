import { AbiItem } from 'web3-utils';

export const ERC20_TOKEN_ABI = [
    {
        constant: true,
        inputs: [],
        name: 'name',
        outputs: [
            {
                name: '',
                type: 'string'
            }
        ],
        payable: false,
        type: 'function'
    },
    {
        constant: false,
        inputs: [
            {
                name: '_spender',
                type: 'address'
            },
            {
                name: '_value',
                type: 'uint256'
            }
        ],
        name: 'approve',
        outputs: [
            {
                name: 'success',
                type: 'bool'
            }
        ],
        payable: false,
        type: 'function'
    },
    {
        constant: true,
        inputs: [],
        name: 'totalSupply',
        outputs: [
            {
                name: '',
                type: 'uint256'
            }
        ],
        payable: false,
        type: 'function'
    },
    {
        constant: true,
        inputs: [],
        name: 'decimals',
        outputs: [
            {
                name: '',
                type: 'uint256'
            }
        ],
        payable: false,
        type: 'function'
    },
    {
        constant: true,
        inputs: [
            {
                name: '_owner',
                type: 'address'
            }
        ],
        name: 'balanceOf',
        outputs: [
            {
                name: 'balance',
                type: 'uint256'
            }
        ],
        payable: false,
        type: 'function'
    },
    {
        constant: true,
        inputs: [],
        name: 'symbol',
        outputs: [
            {
                name: '',
                type: 'string'
            }
        ],
        payable: false,
        type: 'function'
    },
    {
        constant: true,
        inputs: [
            {
                name: '_owner',
                type: 'address'
            },
            {
                name: '_spender',
                type: 'address'
            }
        ],
        name: 'allowance',
        outputs: [
            {
                name: 'remaining',
                type: 'uint256'
            }
        ],
        payable: false,
        type: 'function'
    }
] as AbiItem[];
