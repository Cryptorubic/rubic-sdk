import { AbiItem } from 'web3-utils';

export const bitgertNativeBridgeAbi = [
    {
        inputs: [],
        name: 'paused',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    },
    { inputs: [], name: 'swap', outputs: [], stateMutability: 'payable', type: 'function' }
] as AbiItem[];
