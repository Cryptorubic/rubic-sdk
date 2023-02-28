export const limitOrderContractAbi = [
    {
        inputs: [
            { internalType: 'address', name: 'target', type: 'address' },
            { internalType: 'bytes', name: 'data', type: 'bytes' }
        ],
        name: 'arbitraryStaticCall',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    }
];
