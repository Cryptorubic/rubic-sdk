import { AbiItem } from 'web3-utils';

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
