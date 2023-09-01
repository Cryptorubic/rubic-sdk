import { AbiItem } from 'web3-utils';

export const izumiQuoterContractAbi: AbiItem[] = [
    {
        inputs: [
            { internalType: 'uint128', name: 'amount', type: 'uint128' },
            { internalType: 'bytes', name: 'path', type: 'bytes' }
        ],
        name: 'swapAmount',
        outputs: [
            { internalType: 'uint256', name: 'acquire', type: 'uint256' },
            { internalType: 'int24[]', name: 'pointAfterList', type: 'int24[]' }
        ],
        stateMutability: 'nonpayable',
        type: 'function'
    }
];
