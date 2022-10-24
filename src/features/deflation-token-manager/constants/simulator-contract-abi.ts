import { AbiItem } from 'web3-utils';

export const simulatorContractAbi: AbiItem[] = [
    { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountReceivedBuy', type: 'uint256' },
            { internalType: 'uint256', name: 'amountExpectedBuy', type: 'uint256' },
            { internalType: 'uint256', name: 'amountReceivedTransfer', type: 'uint256' },
            { internalType: 'uint256', name: 'amountExpectedTransfer', type: 'uint256' }
        ],
        name: 'AmntReceived_AmntExpected_Buy',
        type: 'error'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountReceivedBuy', type: 'uint256' },
            { internalType: 'uint256', name: 'amountExpectedBuy', type: 'uint256' },
            { internalType: 'uint256', name: 'amountReceivedSell', type: 'uint256' },
            { internalType: 'uint256', name: 'amountExpectedSell', type: 'uint256' },
            { internalType: 'uint256', name: 'amountReceivedTransfer', type: 'uint256' },
            { internalType: 'uint256', name: 'amountExpectedTransfer', type: 'uint256' }
        ],
        name: 'AmntReceived_AmntExpected_Sell',
        type: 'error'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountReceived', type: 'uint256' },
            { internalType: 'uint256', name: 'amountExpected', type: 'uint256' }
        ],
        name: 'AmntReceived_AmntExpected_Transfer',
        type: 'error'
    },
    {
        inputs: [
            { internalType: 'uint256', name: 'amountReceived', type: 'uint256' },
            { internalType: 'uint256', name: 'amountExpected', type: 'uint256' }
        ],
        name: 'AmntReceived_AmntExpected_TransferSwap',
        type: 'error'
    },
    {
        inputs: [
            { internalType: 'address', name: '_dex', type: 'address' },
            { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
            { internalType: 'address[]', name: '_path', type: 'address[]' },
            { internalType: 'address', name: '_checkToken', type: 'address' },
            { internalType: 'bytes', name: '_data', type: 'bytes' }
        ],
        name: 'simulateBuyWithSwap',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_dex', type: 'address' },
            { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
            { internalType: 'address[]', name: '_path', type: 'address[]' },
            { internalType: 'address', name: '_checkToken', type: 'address' },
            { internalType: 'bytes', name: '_dataBuy', type: 'bytes' },
            { internalType: 'bytes', name: '_dataSell', type: 'bytes' }
        ],
        name: 'simulateSellWithSwaps',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_tokenIn', type: 'address' },
            { internalType: 'uint256', name: '_amount', type: 'uint256' }
        ],
        name: 'simulateTransfer',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_dex', type: 'address' },
            { internalType: 'address', name: '_checkToken', type: 'address' },
            { internalType: 'bytes', name: '_data', type: 'bytes' }
        ],
        name: 'simulateTransferWithSwap',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    }
] as AbiItem[];
