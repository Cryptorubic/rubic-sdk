import { AbiItem } from 'web3-utils';
import {
    LifiCrossChainSupportedBlockchain,
    lifiCrossChainSupportedBlockchains
} from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-cross-chain-supported-blockchain';
import { BLOCKCHAIN_NAME } from 'src/core';

export const lifiContractAddress: Record<LifiCrossChainSupportedBlockchain, string> =
    lifiCrossChainSupportedBlockchains.reduce((acc, blockchain) => {
        if (blockchain === BLOCKCHAIN_NAME.GNOSIS) {
            return {
                ...acc,
                [blockchain]: '0x6f5dA745bA65e8c42166934B55bA62Ef080FcAad'
            };
        }
        return {
            ...acc,
            [blockchain]: '0x1111115F592e50C3A08F68CC2EA0fB9daCCDE798'
        };
    }, {} as Record<LifiCrossChainSupportedBlockchain, string>);

export const lifiContractAbi = [
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
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'integratorToFeeInfo',
        outputs: [
            { internalType: 'bool', name: 'isIntegrator', type: 'bool' },
            { internalType: 'uint32', name: 'tokenFee', type: 'uint32' },
            { internalType: 'uint32', name: 'fixedCryptoShare', type: 'uint32' },
            { internalType: 'uint32', name: 'RubicTokenShare', type: 'uint32' }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                components: [
                    { internalType: 'address', name: 'srcInputToken', type: 'address' },
                    { internalType: 'address', name: 'dstOutputToken', type: 'address' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'address', name: 'recipient', type: 'address' },
                    { internalType: 'uint256', name: 'srcInputAmount', type: 'uint256' },
                    { internalType: 'uint256', name: 'dstMinOutputAmount', type: 'uint256' },
                    { internalType: 'uint256', name: 'dstChainID', type: 'uint256' }
                ],
                internalType: 'struct BridgeBase.BaseCrossChainParams',
                name: '_params',
                type: 'tuple'
            },
            { internalType: 'bytes', name: '_data', type: 'bytes' }
        ],
        name: 'lifiCall',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                components: [
                    { internalType: 'address', name: 'srcInputToken', type: 'address' },
                    { internalType: 'address', name: 'dstOutputToken', type: 'address' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'address', name: 'recipient', type: 'address' },
                    { internalType: 'uint256', name: 'srcInputAmount', type: 'uint256' },
                    { internalType: 'uint256', name: 'dstMinOutputAmount', type: 'uint256' },
                    { internalType: 'uint256', name: 'dstChainID', type: 'uint256' }
                ],
                internalType: 'struct BridgeBase.BaseCrossChainParams',
                name: '_params',
                type: 'tuple'
            },
            { internalType: 'bytes', name: '_data', type: 'bytes' }
        ],
        name: 'lifiCallWithNative',
        outputs: [],
        stateMutability: 'payable',
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
