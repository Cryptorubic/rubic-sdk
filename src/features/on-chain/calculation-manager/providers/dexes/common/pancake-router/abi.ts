import { AbiItem } from 'web3-utils';

export const pancakeRouterAbi: AbiItem[] = [
    {
        inputs: [{ internalType: 'bytes[]', name: 'data', type: 'bytes[]' }],
        name: 'multicall',
        outputs: [{ internalType: 'bytes[]', name: 'results', type: 'bytes[]' }],
        stateMutability: 'payable',
        type: 'function'
    }
];
