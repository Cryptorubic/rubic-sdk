import { AbiItem } from 'web3-utils';

export const stargateRouterEthAbi = [
    {
        inputs: [
            { internalType: 'uint16', name: '_dstChainId', type: 'uint16' },
            { internalType: 'address payable', name: '_refundAddress', type: 'address' },
            { internalType: 'bytes', name: '_toAddress', type: 'bytes' },
            { internalType: 'uint256', name: '_amountLD', type: 'uint256' },
            { internalType: 'uint256', name: '_minAmountLD', type: 'uint256' }
        ],
        name: 'swapETH',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    }
] as AbiItem[];
