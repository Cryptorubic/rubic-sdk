import { AbiItem } from 'web3-utils';

export const bitgertAltcoinBridgeAbi: AbiItem[] = [
    {
        inputs: [],
        name: 'paused',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }],
        name: 'swap',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    }
] as AbiItem[];
