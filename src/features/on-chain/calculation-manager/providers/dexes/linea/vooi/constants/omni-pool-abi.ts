import { AbiItem } from 'web3-utils';

export const omniPoolAbi: AbiItem[] = [
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '_fromAsset',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_toAsset',
                type: 'uint256'
            },
            {
                internalType: 'int256',
                name: '_fromAmount',
                type: 'int256'
            }
        ],
        name: 'quoteFrom',
        outputs: [
            {
                internalType: 'uint256',
                name: 'actualToAmount',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'lpFeeAmount',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    }
];
