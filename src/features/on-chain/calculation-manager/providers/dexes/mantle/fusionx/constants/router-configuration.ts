import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import {
    UniswapV3RouterConfiguration,
    UniswapV3RouterLiquidityPool
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/models/uniswap-v3-router-configuration';
import { AbiItem } from 'web3-utils';

/**
 * Most popular tokens in uni v3 to use in a route.
 */
const tokensSymbols = ['WETH', 'WMNT', 'USDT', 'USDC', 'WBTC', 'MINU'] as const;

type TokenSymbol = (typeof tokensSymbols)[number];

const routerTokens: Record<TokenSymbol, string> = {
    WMNT: wrappedNativeTokensList[BLOCKCHAIN_NAME.MANTLE]!.address,
    WETH: '0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111',
    USDT: '0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE',
    USDC: '0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9',
    WBTC: '0xcabae6f6ea1ecab08ad02fe02ce9a44f09aebfa2',
    MINU: '0x51cfe5b1e764dc253f4c8c1f19a081ff4c3517ed'
};

const routerLiquidityPools: UniswapV3RouterLiquidityPool<TokenSymbol>[] = [
    {
        poolAddress: '0xa125af1a4704044501fe12ca9567ef1550e430e8',
        tokenSymbolA: 'USDT',
        tokenSymbolB: 'WETH',
        fee: 500
    },
    {
        poolAddress: '0x262255f4770aebe2d0c8b97a46287dcecc2a0aff',
        tokenSymbolA: 'USDT',
        tokenSymbolB: 'WMNT',
        fee: 500
    },
    {
        poolAddress: '0x16867d00d45347a2ded25b8cdb7022b3171d4ae0',
        tokenSymbolA: 'USDC',
        tokenSymbolB: 'USDT',
        fee: 100
    },
    {
        poolAddress: '0xb11d56e78076df5b4fea0f3f9f1febdb043fabf3',
        tokenSymbolA: 'USDT',
        tokenSymbolB: 'WBTC',
        fee: 500
    },
    {
        poolAddress: '0x3bfb98c0af1aca0e66d96624c7e545eb131f285e',
        tokenSymbolA: 'MINU',
        tokenSymbolB: 'WMNT',
        fee: 10000
    },
    {
        poolAddress: '0xb1d9358e08391e93593c6a1899dc77931912bb16',
        tokenSymbolA: 'USDT',
        tokenSymbolB: 'MINU',
        fee: 10000
    }
];

export const FUSIONX_ROUTER_CONFIGURATION: UniswapV3RouterConfiguration<TokenSymbol> = {
    tokens: routerTokens,
    liquidityPools: routerLiquidityPools
};

export const FUSIONX_UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS =
    '0x5989FB161568b9F133eDf5Cf6787f5597762797F';
export const FUSIONX_UNISWAP_V3_FACTORY_CONTRACT_ADDRESS =
    '0x530d2766D1988CC1c000C8b7d00334c14B69AD71';

export const FUSIONX_UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI = [
    {
        type: 'constructor',
        inputs: [
            { type: 'address', name: '_deployer', internalType: 'address' },
            { type: 'address', name: '_factory', internalType: 'address' },
            { type: 'address', name: '_WETH9', internalType: 'address' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [{ type: 'address', name: '', internalType: 'address' }],
        name: 'WETH9',
        inputs: []
    },
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [{ type: 'address', name: '', internalType: 'address' }],
        name: 'deployer',
        inputs: []
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [{ type: 'uint256', name: 'amountOut', internalType: 'uint256' }],
        name: 'exactInput',
        inputs: [
            {
                type: 'tuple',
                name: 'params',
                internalType: 'struct ISwapRouter.ExactInputParams',
                components: [
                    { type: 'bytes' },
                    { type: 'address' },
                    { type: 'uint256' },
                    { type: 'uint256' },
                    { type: 'uint256' }
                ]
            }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [{ type: 'uint256', name: 'amountOut', internalType: 'uint256' }],
        name: 'exactInputSingle',
        inputs: [
            {
                type: 'tuple',
                name: 'params',
                internalType: 'struct ISwapRouter.ExactInputSingleParams',
                components: [
                    { type: 'address' },
                    { type: 'address' },
                    { type: 'uint24' },
                    { type: 'address' },
                    { type: 'uint256' },
                    { type: 'uint256' },
                    { type: 'uint256' },
                    { type: 'uint160' }
                ]
            }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [{ type: 'uint256', name: 'amountIn', internalType: 'uint256' }],
        name: 'exactOutput',
        inputs: [
            {
                type: 'tuple',
                name: 'params',
                internalType: 'struct ISwapRouter.ExactOutputParams',
                components: [
                    { type: 'bytes' },
                    { type: 'address' },
                    { type: 'uint256' },
                    { type: 'uint256' },
                    { type: 'uint256' }
                ]
            }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [{ type: 'uint256', name: 'amountIn', internalType: 'uint256' }],
        name: 'exactOutputSingle',
        inputs: [
            {
                type: 'tuple',
                name: 'params',
                internalType: 'struct ISwapRouter.ExactOutputSingleParams',
                components: [
                    { type: 'address' },
                    { type: 'address' },
                    { type: 'uint24' },
                    { type: 'address' },
                    { type: 'uint256' },
                    { type: 'uint256' },
                    { type: 'uint256' },
                    { type: 'uint160' }
                ]
            }
        ]
    },
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [{ type: 'address', name: '', internalType: 'address' }],
        name: 'factory',
        inputs: []
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [],
        name: 'fusionXV3SwapCallback',
        inputs: [
            { type: 'int256', name: 'amount0Delta', internalType: 'int256' },
            { type: 'int256', name: 'amount1Delta', internalType: 'int256' },
            { type: 'bytes', name: '_data', internalType: 'bytes' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [{ type: 'bytes[]', name: 'results', internalType: 'bytes[]' }],
        name: 'multicall',
        inputs: [{ type: 'bytes[]', name: 'data', internalType: 'bytes[]' }]
    },
    { type: 'function', stateMutability: 'payable', outputs: [], name: 'refundETH', inputs: [] },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'selfPermit',
        inputs: [
            { type: 'address', name: 'token', internalType: 'address' },
            { type: 'uint256', name: 'value', internalType: 'uint256' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' },
            { type: 'uint8', name: 'v', internalType: 'uint8' },
            { type: 'bytes32', name: 'r', internalType: 'bytes32' },
            { type: 'bytes32', name: 's', internalType: 'bytes32' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'selfPermitAllowed',
        inputs: [
            { type: 'address', name: 'token', internalType: 'address' },
            { type: 'uint256', name: 'nonce', internalType: 'uint256' },
            { type: 'uint256', name: 'expiry', internalType: 'uint256' },
            { type: 'uint8', name: 'v', internalType: 'uint8' },
            { type: 'bytes32', name: 'r', internalType: 'bytes32' },
            { type: 'bytes32', name: 's', internalType: 'bytes32' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'selfPermitAllowedIfNecessary',
        inputs: [
            { type: 'address', name: 'token', internalType: 'address' },
            { type: 'uint256', name: 'nonce', internalType: 'uint256' },
            { type: 'uint256', name: 'expiry', internalType: 'uint256' },
            { type: 'uint8', name: 'v', internalType: 'uint8' },
            { type: 'bytes32', name: 'r', internalType: 'bytes32' },
            { type: 'bytes32', name: 's', internalType: 'bytes32' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'selfPermitIfNecessary',
        inputs: [
            { type: 'address', name: 'token', internalType: 'address' },
            { type: 'uint256', name: 'value', internalType: 'uint256' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' },
            { type: 'uint8', name: 'v', internalType: 'uint8' },
            { type: 'bytes32', name: 'r', internalType: 'bytes32' },
            { type: 'bytes32', name: 's', internalType: 'bytes32' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'sweepToken',
        inputs: [
            { type: 'address', name: 'token', internalType: 'address' },
            { type: 'uint256', name: 'amountMinimum', internalType: 'uint256' },
            { type: 'address', name: 'recipient', internalType: 'address' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'sweepTokenWithFee',
        inputs: [
            { type: 'address', name: 'token', internalType: 'address' },
            { type: 'uint256', name: 'amountMinimum', internalType: 'uint256' },
            { type: 'address', name: 'recipient', internalType: 'address' },
            { type: 'uint256', name: 'feeBips', internalType: 'uint256' },
            { type: 'address', name: 'feeRecipient', internalType: 'address' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'unwrapWETH9',
        inputs: [
            { type: 'uint256', name: 'amountMinimum', internalType: 'uint256' },
            { type: 'address', name: 'recipient', internalType: 'address' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'unwrapWETH9WithFee',
        inputs: [
            { type: 'uint256', name: 'amountMinimum', internalType: 'uint256' },
            { type: 'address', name: 'recipient', internalType: 'address' },
            { type: 'uint256', name: 'feeBips', internalType: 'uint256' },
            { type: 'address', name: 'feeRecipient', internalType: 'address' }
        ]
    },
    { type: 'receive' }
] as AbiItem[];
