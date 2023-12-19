import { AbiItem } from 'web3-utils';

export const nativeBridgeAbi: AbiItem[] = [
    {
        inputs: [{ internalType: 'address', name: '_receiver', type: 'address' }],
        name: 'wrapAndRelayTokens',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    { stateMutability: 'payable', type: 'receive' }
];
