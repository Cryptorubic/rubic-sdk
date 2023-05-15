import { AbiItem } from 'web3-utils';

export const DE_BRIDGE_GATE_CONTRACT_ABI = [
    {
        inputs: [],
        name: 'globalFixedNativeFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    }
] as AbiItem[];
