import { AbiItem } from 'web3-utils';

export const TRON_MULTICALL_ABI = [
    {
        inputs: [
            {
                components: [
                    { internalType: 'address', name: 'target', type: 'address' },
                    { internalType: 'bytes', name: 'callData', type: 'bytes' }
                ],
                internalType: 'struct Multicall.Call[]',
                name: 'calls',
                type: 'tuple[]'
            }
        ],
        name: 'aggregateViewCalls',
        outputs: [
            { internalType: 'uint256', name: 'blockNumber', type: 'uint256' },
            { internalType: 'bytes[]', name: 'returnData', type: 'bytes[]' },
            { internalType: 'bool[]', name: 'results', type: 'bool[]' }
        ],
        stateMutability: 'view',
        type: 'function'
    }
] as AbiItem[];
