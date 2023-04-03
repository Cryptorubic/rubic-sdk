import { AbiItem } from 'web3-utils';

export const stargateFactoryAbi: AbiItem[] = [
    {
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'getPool',
        outputs: [{ internalType: 'contract Pool', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    }
];
