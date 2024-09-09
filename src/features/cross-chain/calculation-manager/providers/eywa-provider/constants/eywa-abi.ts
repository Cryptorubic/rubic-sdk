import { AbiItem } from 'web3-utils';

export const eywaStartAbi: AbiItem[] = [
    {
        inputs: [
            {
                internalType: 'string[]',
                name: 'operations',
                type: 'string[]'
            },
            {
                internalType: 'bytes[]',
                name: 'params',
                type: 'bytes[]'
            },
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'executionPrice',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'deadline',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint8',
                        name: 'v',
                        type: 'uint8'
                    },
                    {
                        internalType: 'bytes32',
                        name: 'r',
                        type: 'bytes32'
                    },
                    {
                        internalType: 'bytes32',
                        name: 's',
                        type: 'bytes32'
                    }
                ],
                internalType: 'struct IRouterParams.Invoice',
                name: 'receipt',
                type: 'tuple'
            }
        ],
        name: 'start',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    }
];
