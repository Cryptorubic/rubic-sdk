import { AbiItem } from 'web3-utils';

export const AERODROME_ABI = [
    {
        inputs: [],
        name: 'ETHER',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' },
            {
                components: [
                    { internalType: 'address', name: 'from', type: 'address' },
                    { internalType: 'address', name: 'to', type: 'address' },
                    { internalType: 'bool', name: 'stable', type: 'bool' },
                    { internalType: 'address', name: 'factory', type: 'address' }
                ],
                internalType: 'struct IRouter.Route[]',
                name: 'routes',
                type: 'tuple[]'
            },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'deadline', type: 'uint256' }
        ],
        name: 'UNSAFE_swapExactTokensForTokens',
        outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'defaultFactory',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'factoryRegistry',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
            {
                components: [
                    { internalType: 'address', name: 'from', type: 'address' },
                    { internalType: 'address', name: 'to', type: 'address' },
                    { internalType: 'bool', name: 'stable', type: 'bool' },
                    { internalType: 'address', name: 'factory', type: 'address' }
                ],
                internalType: 'struct IRouter.Route[]',
                name: 'routes',
                type: 'tuple[]'
            }
        ],
        name: 'getAmountsOut',
        outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: 'tokenA', type: 'address' },
            { internalType: 'address', name: 'tokenB', type: 'address' },
            { internalType: 'bool', name: 'stable', type: 'bool' },
            { internalType: 'address', name: '_factory', type: 'address' }
        ],
        name: 'getReserves',
        outputs: [
            { internalType: 'uint256', name: 'reserveA', type: 'uint256' },
            { internalType: 'uint256', name: 'reserveB', type: 'uint256' }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: 'forwarder', type: 'address' }],
        name: 'isTrustedForwarder',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: 'tokenA', type: 'address' },
            { internalType: 'address', name: 'tokenB', type: 'address' },
            { internalType: 'bool', name: 'stable', type: 'bool' },
            { internalType: 'address', name: '_factory', type: 'address' }
        ],
        name: 'poolFor',
        outputs: [{ internalType: 'address', name: 'pool', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: 'tokenA', type: 'address' },
            { internalType: 'address', name: 'tokenB', type: 'address' }
        ],
        name: 'sortTokens',
        outputs: [
            { internalType: 'address', name: 'token0', type: 'address' },
            { internalType: 'address', name: 'token1', type: 'address' }
        ],
        stateMutability: 'pure',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
            {
                components: [
                    { internalType: 'address', name: 'from', type: 'address' },
                    { internalType: 'address', name: 'to', type: 'address' },
                    { internalType: 'bool', name: 'stable', type: 'bool' },
                    { internalType: 'address', name: 'factory', type: 'address' }
                ],
                internalType: 'struct IRouter.Route[]',
                name: 'routes',
                type: 'tuple[]'
            },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'deadline', type: 'uint256' }
        ],
        name: 'swapExactETHForTokens',
        outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
            {
                components: [
                    { internalType: 'address', name: 'from', type: 'address' },
                    { internalType: 'address', name: 'to', type: 'address' },
                    { internalType: 'bool', name: 'stable', type: 'bool' },
                    { internalType: 'address', name: 'factory', type: 'address' }
                ],
                internalType: 'struct IRouter.Route[]',
                name: 'routes',
                type: 'tuple[]'
            },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'deadline', type: 'uint256' }
        ],
        name: 'swapExactETHForTokensSupportingFeeOnTransferTokens',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
            { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
            {
                components: [
                    { internalType: 'address', name: 'from', type: 'address' },
                    { internalType: 'address', name: 'to', type: 'address' },
                    { internalType: 'bool', name: 'stable', type: 'bool' },
                    { internalType: 'address', name: 'factory', type: 'address' }
                ],
                internalType: 'struct IRouter.Route[]',
                name: 'routes',
                type: 'tuple[]'
            },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'deadline', type: 'uint256' }
        ],
        name: 'swapExactTokensForETH',
        outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
            { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
            {
                components: [
                    { internalType: 'address', name: 'from', type: 'address' },
                    { internalType: 'address', name: 'to', type: 'address' },
                    { internalType: 'bool', name: 'stable', type: 'bool' },
                    { internalType: 'address', name: 'factory', type: 'address' }
                ],
                internalType: 'struct IRouter.Route[]',
                name: 'routes',
                type: 'tuple[]'
            },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'deadline', type: 'uint256' }
        ],
        name: 'swapExactTokensForETHSupportingFeeOnTransferTokens',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
            { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
            {
                components: [
                    { internalType: 'address', name: 'from', type: 'address' },
                    { internalType: 'address', name: 'to', type: 'address' },
                    { internalType: 'bool', name: 'stable', type: 'bool' },
                    { internalType: 'address', name: 'factory', type: 'address' }
                ],
                internalType: 'struct IRouter.Route[]',
                name: 'routes',
                type: 'tuple[]'
            },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'deadline', type: 'uint256' }
        ],
        name: 'swapExactTokensForTokens',
        outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
            { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
            {
                components: [
                    { internalType: 'address', name: 'from', type: 'address' },
                    { internalType: 'address', name: 'to', type: 'address' },
                    { internalType: 'bool', name: 'stable', type: 'bool' },
                    { internalType: 'address', name: 'factory', type: 'address' }
                ],
                internalType: 'struct IRouter.Route[]',
                name: 'routes',
                type: 'tuple[]'
            },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'deadline', type: 'uint256' }
        ],
        name: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    { stateMutability: 'payable', type: 'receive' }
] as AbiItem[];
