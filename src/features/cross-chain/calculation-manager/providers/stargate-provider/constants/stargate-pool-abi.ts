import { AbiItem } from 'web3-utils';

export const stargatePoolAbi: AbiItem[] = [
    {
        inputs: [],
        name: 'token',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    }
];
