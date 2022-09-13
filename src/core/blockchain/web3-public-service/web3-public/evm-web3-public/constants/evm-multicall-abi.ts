import { AbiItem } from 'web3-utils';

export const EVM_MULTICALL_ABI = [
    {
        inputs: [
            { internalType: 'bool', name: 'requireSuccess', type: 'bool' },
            {
                components: [
                    { internalType: 'address', name: 'target', type: 'address' },
                    { internalType: 'bytes', name: 'callData', type: 'bytes' }
                ],
                internalType: 'struct Multicall2.Call[]',
                name: 'calls',
                type: 'tuple[]'
            }
        ],
        name: 'tryAggregate',
        outputs: [
            {
                components: [
                    { internalType: 'bool', name: 'success', type: 'bool' },
                    { internalType: 'bytes', name: 'returnData', type: 'bytes' }
                ],
                internalType: 'struct Multicall2.Result[]',
                name: 'returnData',
                type: 'tuple[]'
            }
        ],
        stateMutability: 'nonpayable',
        type: 'function'
    }
] as AbiItem[];
