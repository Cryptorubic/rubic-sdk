import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { AbiItem } from 'web3-utils';

export const onChainProxyContractAddress: Record<BlockchainName, string> = Object.values(
    BLOCKCHAIN_NAME
).reduce((acc, blockchain) => {
    let contractAddress = '0x4B888D9756E9a3538E65b020f22ADFeE969bff61';
    if (blockchain === BLOCKCHAIN_NAME.POLYGON) {
        contractAddress = '0x1cBb985D2623C3AB4F671CAe1a0f115E5Ba30e9c';
    }
    return {
        ...acc,
        [blockchain]: contractAddress
    };
}, {} as Record<BlockchainName, string>);

export const onChainProxyContractAbi = [
    {
        inputs: [
            {
                components: [
                    { internalType: 'address', name: 'inputToken', type: 'address' },
                    { internalType: 'uint256', name: 'inputAmount', type: 'uint256' },
                    { internalType: 'address', name: 'outputToken', type: 'address' },
                    { internalType: 'uint256', name: 'minOutputAmount', type: 'uint256' },
                    { internalType: 'address', name: 'recipient', type: 'address' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'address', name: 'dex', type: 'address' }
                ],
                internalType: 'struct InstantProxy.InstantTradesParams',
                name: '_params',
                type: 'tuple'
            },
            { internalType: 'bytes', name: '_data', type: 'bytes' }
        ],
        name: 'instantTrade',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                components: [
                    { internalType: 'address', name: 'inputToken', type: 'address' },
                    { internalType: 'uint256', name: 'inputAmount', type: 'uint256' },
                    { internalType: 'address', name: 'outputToken', type: 'address' },
                    { internalType: 'uint256', name: 'minOutputAmount', type: 'uint256' },
                    { internalType: 'address', name: 'recipient', type: 'address' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'address', name: 'dex', type: 'address' }
                ],
                internalType: 'struct InstantProxy.InstantTradesParams',
                name: '_params',
                type: 'tuple'
            },
            { internalType: 'bytes', name: '_data', type: 'bytes' }
        ],
        name: 'instantTradeNative',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'integratorToFeeInfo',
        outputs: [
            { internalType: 'bool', name: 'isIntegrator', type: 'bool' },
            { internalType: 'uint32', name: 'tokenFee', type: 'uint32' },
            { internalType: 'uint32', name: 'RubicTokenShare', type: 'uint32' },
            { internalType: 'uint32', name: 'RubicFixedCryptoShare', type: 'uint32' },
            { internalType: 'uint128', name: 'fixedFeeAmount', type: 'uint128' }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'RubicPlatformFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'fixedCryptoFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'getAvailableRouters',
        outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'paused',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    }
] as AbiItem[];
