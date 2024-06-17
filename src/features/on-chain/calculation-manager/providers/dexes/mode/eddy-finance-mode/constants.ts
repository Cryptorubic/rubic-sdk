import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { defaultModeProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/mode/default-constants';
import { AbiItem } from 'web3-utils';

export const EDDY_FINANCE_MODE_PROVIDER_CONFIGURATION: UniswapV2ProviderConfiguration = {
    ...defaultModeProviderConfiguration,
    maxTransitTokens: 1
};

export const EDDY_FINANCE_MODE_SWAP_CONTRACT_ADDRESS = '0xCb0ca072EFb267F17289574Bf563e8dF05c7Ffe3';

export const EDDY_FINANCE_MODE_CALCULATE_CONTRACT_ADDRESS =
    '0xc1e624C810D297FD70eF53B0E08F44FABE468591';

export const EDDY_FINANCE_MODE_SWAP_CONTRACT_ABI = [
    {
        inputs: [],
        name: 'WETH',
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
    // ETH → any
    {
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
        name: 'swapEddyExactETHForTokens',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'payable',
        type: 'function'
    },
    // Any → ETH
    {
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
        name: 'swapEddyExactTokensForEth',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    // Any → Any
    {
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
        name: 'swapEddyTokensForTokens',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'nonpayable',
        type: 'function'
    }
] as AbiItem[];
