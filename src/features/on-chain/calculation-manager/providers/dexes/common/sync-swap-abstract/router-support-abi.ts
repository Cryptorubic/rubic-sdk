import { AbiItem } from 'web3-utils';

export const routerSupportAbi: AbiItem[] = [
    {
        inputs: [
            { internalType: 'address', name: 'tokenA', type: 'address' },
            { internalType: 'address', name: 'tokenB', type: 'address' },
            { internalType: 'address[]', name: 'factories', type: 'address[]' },
            { internalType: 'address[]', name: 'baseTokens', type: 'address[]' },
            { internalType: 'address', name: 'master', type: 'address' },
            { internalType: 'address', name: 'account', type: 'address' }
        ],
        name: 'getRoutePools',
        outputs: [
            {
                components: [
                    {
                        components: [
                            { internalType: 'address', name: 'pool', type: 'address' },
                            { internalType: 'address', name: 'tokenA', type: 'address' },
                            { internalType: 'address', name: 'tokenB', type: 'address' },
                            { internalType: 'uint16', name: 'poolType', type: 'uint16' },
                            { internalType: 'uint256', name: 'reserveA', type: 'uint256' },
                            { internalType: 'uint256', name: 'reserveB', type: 'uint256' },
                            { internalType: 'uint24', name: 'swapFeeAB', type: 'uint24' },
                            { internalType: 'uint24', name: 'swapFeeBA', type: 'uint24' }
                        ],
                        internalType: 'struct RouteHelper.RoutePool[]',
                        name: 'poolsDirect',
                        type: 'tuple[]'
                    },
                    {
                        components: [
                            { internalType: 'address', name: 'pool', type: 'address' },
                            { internalType: 'address', name: 'tokenA', type: 'address' },
                            { internalType: 'address', name: 'tokenB', type: 'address' },
                            { internalType: 'uint16', name: 'poolType', type: 'uint16' },
                            { internalType: 'uint256', name: 'reserveA', type: 'uint256' },
                            { internalType: 'uint256', name: 'reserveB', type: 'uint256' },
                            { internalType: 'uint24', name: 'swapFeeAB', type: 'uint24' },
                            { internalType: 'uint24', name: 'swapFeeBA', type: 'uint24' }
                        ],
                        internalType: 'struct RouteHelper.RoutePool[]',
                        name: 'poolsA',
                        type: 'tuple[]'
                    },
                    {
                        components: [
                            { internalType: 'address', name: 'pool', type: 'address' },
                            { internalType: 'address', name: 'tokenA', type: 'address' },
                            { internalType: 'address', name: 'tokenB', type: 'address' },
                            { internalType: 'uint16', name: 'poolType', type: 'uint16' },
                            { internalType: 'uint256', name: 'reserveA', type: 'uint256' },
                            { internalType: 'uint256', name: 'reserveB', type: 'uint256' },
                            { internalType: 'uint24', name: 'swapFeeAB', type: 'uint24' },
                            { internalType: 'uint24', name: 'swapFeeBA', type: 'uint24' }
                        ],
                        internalType: 'struct RouteHelper.RoutePool[]',
                        name: 'poolsB',
                        type: 'tuple[]'
                    },
                    {
                        components: [
                            { internalType: 'address', name: 'pool', type: 'address' },
                            { internalType: 'address', name: 'tokenA', type: 'address' },
                            { internalType: 'address', name: 'tokenB', type: 'address' },
                            { internalType: 'uint16', name: 'poolType', type: 'uint16' },
                            { internalType: 'uint256', name: 'reserveA', type: 'uint256' },
                            { internalType: 'uint256', name: 'reserveB', type: 'uint256' },
                            { internalType: 'uint24', name: 'swapFeeAB', type: 'uint24' },
                            { internalType: 'uint24', name: 'swapFeeBA', type: 'uint24' }
                        ],
                        internalType: 'struct RouteHelper.RoutePool[]',
                        name: 'poolsBase',
                        type: 'tuple[]'
                    }
                ],
                internalType: 'struct RouteHelper.RoutePools',
                name: 'routePools',
                type: 'tuple'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
        name: 'isContract',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    }
];
