import { AbiItem } from 'web3-utils';

export const simulatorContractAbi: AbiItem[] = [
    {
        inputs: [
            { internalType: 'address', name: '_dex', type: 'address' },
            { internalType: 'address', name: '_checkToken', type: 'address' },
            { internalType: 'bytes', name: '_data', type: 'bytes' }
        ],
        name: 'simulateTransferWithSwap',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    }
] as AbiItem[];
