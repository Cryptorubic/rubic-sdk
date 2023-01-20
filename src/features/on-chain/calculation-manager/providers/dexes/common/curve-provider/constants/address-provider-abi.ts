import { AbiItem } from 'web3-utils';

export const addressProviderAbi: AbiItem[] = [
    {
        name: 'get_address',
        outputs: [{ type: 'address', name: '' }],
        inputs: [{ type: 'uint256', name: '_id' }],
        stateMutability: 'view',
        type: 'function',
        gas: 1308
    }
];
