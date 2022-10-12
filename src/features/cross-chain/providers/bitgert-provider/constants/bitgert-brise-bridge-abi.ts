import { AbiItem } from 'web3-utils';

export const bitgertBriseBridgeAbi = [
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'Swap',
        inputs: [{ type: 'uint256', name: '_amount', internalType: 'uint256' }]
    }
] as AbiItem[];
