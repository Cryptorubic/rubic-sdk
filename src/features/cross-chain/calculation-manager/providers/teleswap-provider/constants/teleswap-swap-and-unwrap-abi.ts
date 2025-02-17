import { AbiItem } from 'web3-utils';

/**
 * Abi for swapAndUnwrap method of base chains.
 */
export const teleswapSwapAndUnwrapAbi: AbiItem[] = [
    {
        inputs: [
            { internalType: 'address', name: '_exchangeConnector', type: 'address' },
            { internalType: 'uint256[]', name: '_amounts', type: 'uint256[]' },
            { internalType: 'bool', name: '_isFixedToken', type: 'bool' },
            { internalType: 'address[]', name: '_path', type: 'address[]' },
            { internalType: 'uint256', name: '_deadline', type: 'uint256' },
            { internalType: 'bytes', name: '_userScript', type: 'bytes' },
            { internalType: 'enum ScriptTypes', name: '_scriptType', type: 'uint8' },
            { internalType: 'bytes', name: '_lockerLockingScript', type: 'bytes' },
            { internalType: 'uint256', name: 'thirdParty', type: 'uint256' }
        ],
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'swapAndUnwrap',
        type: 'function',
        stateMutability: 'nonpayable'
    }
];

/**
 * Abi for swapAndUnwrap method of cross-chain chains.
 */
export const teleswapSwapAndUwrapAbiForCcrChains: AbiItem[] = [
    {
        inputs: [
            { internalType: 'address', name: '_token', type: 'address' },
            { internalType: 'address', name: '_exchangeConnector', type: 'address' },
            { internalType: 'uint256[]', name: '_amounts', type: 'uint256[]' },
            { internalType: 'bool', name: '_isInputFixed', type: 'bool' },
            { internalType: 'address[]', name: '_path', type: 'address[]' },
            {
                internalType: 'tuple',
                name: '_userAndLockerScript',
                type: 'tuple',
                components: [
                    { internalType: 'bytes', name: 'userScript', type: 'bytes' },
                    { internalType: 'enum ScriptTypes', name: 'scriptType', type: 'uint8' },
                    { internalType: 'bytes', name: 'lockerLockingScript', type: 'bytes' }
                ]
            },
            { internalType: 'int64', name: '_relayerFeePercentage', type: 'int64' },
            { internalType: 'uint256', name: '_thirdParty', type: 'uint256' }
        ],
        name: 'swapAndUnwrap',
        type: 'function',
        stateMutability: 'payable',
        outputs: []
    }
];
