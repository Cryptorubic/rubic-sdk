import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { defaultHorizenEonProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/horizen-eon/default-constants';
import { AbiItem } from 'web3-utils';

export const ASCENT_HORIZEN_EON_CONTRACT_ADDRESS = '0xcBE5798aeC48bed4bd90DD60882b4a9665bA33E2';

export const ASCENT_HORIZEN_EON_PROVIDER_CONFIGURATION: UniswapV2ProviderConfiguration = {
    ...defaultHorizenEonProviderConfiguration
};

export const ASCENT_CONTRACT_ABI: AbiItem[] = [
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [
            { type: 'uint256', name: 'amount', internalType: 'uint256' },
            { type: 'bool', name: 'stable', internalType: 'bool' }
        ],
        name: 'getAmountOut',
        inputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'address', name: 'tokenIn', internalType: 'address' },
            { type: 'address', name: 'tokenOut', internalType: 'address' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'getAmountsOut',
        inputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            {
                type: 'tuple[]',
                name: 'routes',
                internalType: 'struct RouterV2.route[]',
                components: [
                    { type: 'address', name: 'from', internalType: 'address' },
                    { type: 'address', name: 'to', internalType: 'address' },
                    { type: 'bool', name: 'stable', internalType: 'bool' }
                ]
            }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'swapExactETHForTokens',
        inputs: [
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            {
                type: 'tuple[]',
                name: 'routes',
                internalType: 'struct RouterV2.route[]',
                components: [
                    { type: 'address', name: 'from', internalType: 'address' },
                    { type: 'address', name: 'to', internalType: 'address' },
                    { type: 'bool', name: 'stable', internalType: 'bool' }
                ]
            },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'swapExactETHForTokensSupportingFeeOnTransferTokens',
        inputs: [
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            {
                type: 'tuple[]',
                name: 'routes',
                internalType: 'struct RouterV2.route[]',
                components: [
                    { type: 'address', name: 'from', internalType: 'address' },
                    { type: 'address', name: 'to', internalType: 'address' },
                    { type: 'bool', name: 'stable', internalType: 'bool' }
                ]
            },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'swapExactTokensForETH',
        inputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            {
                type: 'tuple[]',
                name: 'routes',
                internalType: 'struct RouterV2.route[]',
                components: [
                    { type: 'address', name: 'from', internalType: 'address' },
                    { type: 'address', name: 'to', internalType: 'address' },
                    { type: 'bool', name: 'stable', internalType: 'bool' }
                ]
            },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [],
        name: 'swapExactTokensForETHSupportingFeeOnTransferTokens',
        inputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            {
                type: 'tuple[]',
                name: 'routes',
                internalType: 'struct RouterV2.route[]',
                components: [
                    { type: 'address', name: 'from', internalType: 'address' },
                    { type: 'address', name: 'to', internalType: 'address' },
                    { type: 'bool', name: 'stable', internalType: 'bool' }
                ]
            },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'swapExactTokensForTokens',
        inputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            {
                type: 'tuple[]',
                name: 'routes',
                internalType: 'struct RouterV2.route[]',
                components: [
                    { type: 'address', name: 'from', internalType: 'address' },
                    { type: 'address', name: 'to', internalType: 'address' },
                    { type: 'bool', name: 'stable', internalType: 'bool' }
                ]
            },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'swapExactTokensForTokensSimple',
        inputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            { type: 'address', name: 'tokenFrom', internalType: 'address' },
            { type: 'address', name: 'tokenTo', internalType: 'address' },
            { type: 'bool', name: 'stable', internalType: 'bool' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [],
        name: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
        inputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            {
                type: 'tuple[]',
                name: 'routes',
                internalType: 'struct RouterV2.route[]',
                components: [
                    { type: 'address', name: 'from', internalType: 'address' },
                    { type: 'address', name: 'to', internalType: 'address' },
                    { type: 'bool', name: 'stable', internalType: 'bool' }
                ]
            },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    }
];
