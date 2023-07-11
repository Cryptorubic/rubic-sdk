import { AbiItem } from 'web3-utils';

export const retryableFactoryAbi: AbiItem[] = [
    {
        inputs: [{ internalType: 'bytes32', name: 'ticketId', type: 'bytes32' }],
        name: 'redeem',
        outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
        stateMutability: 'nonpayable',
        type: 'function'
    }
];
