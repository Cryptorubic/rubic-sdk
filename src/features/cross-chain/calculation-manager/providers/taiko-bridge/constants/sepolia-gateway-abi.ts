import { AbiItem } from 'web3-utils';

export const sepoliaBridgeABI: AbiItem[] = [
    {
        stateMutability: 'payable',
        type: 'function',
        inputs: [
            {
                name: 'message',
                internalType: 'struct IBridge.Message',
                type: 'tuple',
                components: [
                    { name: 'id', internalType: 'uint256', type: 'uint256' },
                    { name: 'from', internalType: 'address', type: 'address' },
                    { name: 'srcChainId', internalType: 'uint256', type: 'uint256' },
                    { name: 'destChainId', internalType: 'uint256', type: 'uint256' },
                    { name: 'user', internalType: 'address', type: 'address' },
                    { name: 'to', internalType: 'address', type: 'address' },
                    { name: 'refundTo', internalType: 'address', type: 'address' },
                    { name: 'value', internalType: 'uint256', type: 'uint256' },
                    { name: 'fee', internalType: 'uint256', type: 'uint256' },
                    { name: 'gasLimit', internalType: 'uint256', type: 'uint256' },
                    { name: 'data', internalType: 'bytes', type: 'bytes' },
                    { name: 'memo', internalType: 'string', type: 'string' },
                ],
            },
        ],
        name: 'sendMessage',
        outputs: [{ name: 'msgHash', internalType: 'bytes32', type: 'bytes32' }],
    },
]