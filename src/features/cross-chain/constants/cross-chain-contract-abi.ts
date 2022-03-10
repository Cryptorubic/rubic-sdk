import { AbiItem } from 'web3-utils';

export const crossChainContractAbi = [
    {
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'RubicAddresses',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'blockchainCryptoFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'feeAmountOfBlockchain',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'maxGasPrice',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'maxTokenAmount',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'minTokenAmount',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'numOfThisBlockchain',
        outputs: [{ internalType: 'uint128', name: '', type: 'uint128' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'paused',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                components: [
                    { internalType: 'uint256', name: 'blockchain', type: 'uint256' },
                    { internalType: 'uint256', name: 'tokenInAmount', type: 'uint256' },
                    { internalType: 'address[]', name: 'firstPath', type: 'address[]' },
                    { internalType: 'address[]', name: 'secondPath', type: 'address[]' },
                    { internalType: 'uint256', name: 'exactRBCtokenOut', type: 'uint256' },
                    { internalType: 'uint256', name: 'tokenOutMin', type: 'uint256' },
                    { internalType: 'string', name: 'newAddress', type: 'string' },
                    { internalType: 'bool', name: 'swapToCrypto', type: 'bool' }
                ],
                internalType: 'struct SwapContract.swapToParams',
                name: 'params',
                type: 'tuple'
            }
        ],
        name: 'swapCryptoToOtherBlockchain',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                components: [
                    { internalType: 'address', name: 'user', type: 'address' },
                    { internalType: 'uint256', name: 'amountWithFee', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'bytes32', name: 'originalTxHash', type: 'bytes32' },
                    { internalType: 'bytes', name: 'concatSignatures', type: 'bytes' }
                ],
                internalType: 'struct SwapContract.swapFromParams',
                name: 'params',
                type: 'tuple'
            }
        ],
        name: 'swapCryptoToUserWithFee',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                components: [
                    { internalType: 'uint256', name: 'blockchain', type: 'uint256' },
                    { internalType: 'uint256', name: 'tokenInAmount', type: 'uint256' },
                    { internalType: 'address[]', name: 'firstPath', type: 'address[]' },
                    { internalType: 'address[]', name: 'secondPath', type: 'address[]' },
                    { internalType: 'uint256', name: 'exactRBCtokenOut', type: 'uint256' },
                    { internalType: 'uint256', name: 'tokenOutMin', type: 'uint256' },
                    { internalType: 'string', name: 'newAddress', type: 'string' },
                    { internalType: 'bool', name: 'swapToCrypto', type: 'bool' }
                ],
                internalType: 'struct SwapContract.swapToParams',
                name: 'params',
                type: 'tuple'
            }
        ],
        name: 'swapTokensToOtherBlockchain',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                components: [
                    { internalType: 'address', name: 'user', type: 'address' },
                    { internalType: 'uint256', name: 'amountWithFee', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'bytes32', name: 'originalTxHash', type: 'bytes32' },
                    { internalType: 'bytes', name: 'concatSignatures', type: 'bytes' }
                ],
                internalType: 'struct SwapContract.swapFromParams',
                name: 'params',
                type: 'tuple'
            }
        ],
        name: 'swapTokensToUserWithFee',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    }
] as AbiItem[];
