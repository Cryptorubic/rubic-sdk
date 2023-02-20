import { AbiItem } from 'web3-utils';

export const feeLibraryAbi: AbiItem[] = [
    {
        inputs: [
            { internalType: 'uint256', name: 'srcPoolId', type: 'uint256' },
            { internalType: 'uint256', name: 'dstPoolId', type: 'uint256' },
            { internalType: 'uint16', name: 'dstChainId', type: 'uint16' },
            { internalType: 'uint256', name: 'amountSD', type: 'uint256' },
            { internalType: 'bool', name: 'whitelisted', type: 'bool' },
            { internalType: 'bool', name: 'hasEqReward', type: 'bool' }
        ],
        name: 'getEquilibriumFee',
        outputs: [
            { internalType: 'uint256', name: '', type: 'uint256' },
            { internalType: 'uint256', name: '', type: 'uint256' }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: '_srcPoolId', type: 'uint256' },
            { internalType: 'uint256', name: '_dstPoolId', type: 'uint256' },
            { internalType: 'uint16', name: '_dstChainId', type: 'uint16' },
            { internalType: 'address', name: '_from', type: 'address' },
            { internalType: 'uint256', name: '_amountSD', type: 'uint256' }
        ],
        name: 'getFees',
        outputs: [
            {
                components: [
                    { internalType: 'uint256', name: 'amount', type: 'uint256' },
                    { internalType: 'uint256', name: 'eqFee', type: 'uint256' },
                    { internalType: 'uint256', name: 'eqReward', type: 'uint256' },
                    { internalType: 'uint256', name: 'lpFee', type: 'uint256' },
                    { internalType: 'uint256', name: 'protocolFee', type: 'uint256' },
                    { internalType: 'uint256', name: 'lkbRemove', type: 'uint256' }
                ],
                internalType: 'struct Pool.SwapObj',
                name: 's',
                type: 'tuple'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    }
];
