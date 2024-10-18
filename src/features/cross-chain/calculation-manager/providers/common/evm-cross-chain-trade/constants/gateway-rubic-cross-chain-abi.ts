import { AbiItem } from 'web3-utils';

export const gatewayRubicCrossChainAbi: AbiItem[] = [
    {
        inputs: [
            { internalType: 'address[]', name: 'tokens', type: 'address[]' },
            { internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' },
            { internalType: 'bytes', name: 'facetCallData', type: 'bytes' }
        ],
        name: 'startViaRubic',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    }
];
