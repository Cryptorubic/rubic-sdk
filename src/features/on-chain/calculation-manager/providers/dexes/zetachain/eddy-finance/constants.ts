import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { defaultZetachainProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/zetachain/default-constants';
import { AbiItem } from 'web3-utils';

export const EDDY_FINANCE_PROVIDER_CONFIGURATION: UniswapV2ProviderConfiguration = {
    ...defaultZetachainProviderConfiguration,
    maxTransitTokens: 1
};

export const EDDY_FINANCE_SWAP_CONTRACT_ADDRESS = '0xde3167958ad6251e8d6ff1791648b322fc6b51bd';

export const EDDY_FINANCE_SWAP_CONTRACT_ABI = [
    {
        inputs: [],
        name: 'WZETA',
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
    // Zeta → any
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
    // Any → Zeta
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

export const EDDY_FINANCE_CALCULATE_CONTRACT_ADDRESS = '0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe';
