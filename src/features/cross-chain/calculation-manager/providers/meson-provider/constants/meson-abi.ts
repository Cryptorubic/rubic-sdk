import { AbiItem } from 'web3-utils';

export const MESON_ABI = [
    {
        inputs: [
            { internalType: 'uint256', name: 'encodedSwap', type: 'uint256' },
            { internalType: 'uint200', name: 'postingValue', type: 'uint200' },
            { internalType: 'address', name: 'contractAddress', type: 'address' }
        ],
        name: 'postSwapFromContract',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    }
] as AbiItem[];
