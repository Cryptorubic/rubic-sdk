import { AbiItem } from 'web3-utils';

export const BLAZE_SWAP_FLARE_ABI: AbiItem[] = [
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'amountOut',
                type: 'uint256'
            },
            {
                internalType: 'address[]',
                name: 'path',
                type: 'address[]'
            }
        ],
        name: 'getAmountsIn',
        outputs: [
            {
                internalType: 'uint256[]',
                name: 'amounts',
                type: 'uint256[]'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'amountIn',
                type: 'uint256'
            },
            {
                internalType: 'address[]',
                name: 'path',
                type: 'address[]'
            }
        ],
        name: 'getAmountsOut',
        outputs: [
            {
                internalType: 'uint256[]',
                name: 'amounts',
                type: 'uint256[]'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        ///////////
        inputs: [
            {
                internalType: 'uint256',
                name: 'amountOutMin',
                type: 'uint256'
            },
            {
                internalType: 'address[]',
                name: 'path',
                type: 'address[]'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'deadline',
                type: 'uint256'
            }
        ],
        name: 'swapExactNATForTokens',
        outputs: [
            {
                internalType: 'uint256[]',
                name: 'amountsSent',
                type: 'uint256[]'
            },
            {
                internalType: 'uint256[]',
                name: 'amountsRecv',
                type: 'uint256[]'
            }
        ],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        //////////
        inputs: [
            {
                internalType: 'uint256',
                name: 'amountIn',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'amountOutMin',
                type: 'uint256'
            },
            {
                internalType: 'address[]',
                name: 'path',
                type: 'address[]'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'deadline',
                type: 'uint256'
            }
        ],
        name: 'swapExactTokensForNAT',
        outputs: [
            {
                internalType: 'uint256[]',
                name: 'amountsSent',
                type: 'uint256[]'
            },
            {
                internalType: 'uint256[]',
                name: 'amountsRecv',
                type: 'uint256[]'
            }
        ],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        ////////
        inputs: [
            {
                internalType: 'uint256',
                name: 'amountIn',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'amountOutMin',
                type: 'uint256'
            },
            {
                internalType: 'address[]',
                name: 'path',
                type: 'address[]'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'deadline',
                type: 'uint256'
            }
        ],
        name: 'swapExactTokensForTokens',
        outputs: [
            {
                internalType: 'uint256[]',
                name: 'amountsSent',
                type: 'uint256[]'
            },
            {
                internalType: 'uint256[]',
                name: 'amountsRecv',
                type: 'uint256[]'
            }
        ],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        /////
        inputs: [
            {
                internalType: 'uint256',
                name: 'amountOut',
                type: 'uint256'
            },
            {
                internalType: 'address[]',
                name: 'path',
                type: 'address[]'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'deadline',
                type: 'uint256'
            }
        ],
        name: 'swapNATForExactTokens',
        outputs: [
            {
                internalType: 'uint256[]',
                name: 'amounts',
                type: 'uint256[]'
            }
        ],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        /////
        inputs: [
            {
                internalType: 'uint256',
                name: 'amountOut',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'amountInMax',
                type: 'uint256'
            },
            {
                internalType: 'address[]',
                name: 'path',
                type: 'address[]'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'deadline',
                type: 'uint256'
            }
        ],
        name: 'swapTokensForExactNAT',
        outputs: [
            {
                internalType: 'uint256[]',
                name: 'amounts',
                type: 'uint256[]'
            }
        ],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        /////
        inputs: [
            {
                internalType: 'uint256',
                name: 'amountOut',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'amountInMax',
                type: 'uint256'
            },
            {
                internalType: 'address[]',
                name: 'path',
                type: 'address[]'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'deadline',
                type: 'uint256'
            }
        ],
        name: 'swapTokensForExactTokens',
        outputs: [
            {
                internalType: 'uint256[]',
                name: 'amounts',
                type: 'uint256[]'
            }
        ],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        /////
        inputs: [],
        name: 'wNat',
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
        stateMutability: 'payable',
        type: 'receive'
    }
];
