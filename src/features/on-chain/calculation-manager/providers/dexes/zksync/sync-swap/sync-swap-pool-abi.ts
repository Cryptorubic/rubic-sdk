import { AbiItem } from 'web3-utils';

export const syncSwapPoolAbi: AbiItem[] = [
    {
        inputs: [
            {
                internalType: 'address',
                name: '_tokenIn',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: '_amountIn',
                type: 'uint256'
            },
            {
                internalType: 'address',
                name: '_sender',
                type: 'address'
            }
        ],
        name: 'getAmountOut',
        outputs: [
            {
                internalType: 'uint256',
                name: '_amountOut',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    }
];
