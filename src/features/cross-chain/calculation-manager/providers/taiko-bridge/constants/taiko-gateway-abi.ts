import { AbiItem } from 'web3-utils';

export const taikoNativeBridgeABI: AbiItem[] = [
    {
        inputs: [
            {
                components: [
                    { internalType: 'uint128', name: 'id', type: 'uint128' },
                    { internalType: 'address', name: 'from', type: 'address' },
                    { internalType: 'uint64', name: 'srcChainId', type: 'uint64' },
                    { internalType: 'uint64', name: 'destChainId', type: 'uint64' },
                    { internalType: 'address', name: 'owner', type: 'address' },
                    { internalType: 'address', name: 'to', type: 'address' },
                    { internalType: 'address', name: 'refundTo', type: 'address' },
                    { internalType: 'uint256', name: 'value', type: 'uint256' },
                    { internalType: 'uint256', name: 'fee', type: 'uint256' },
                    { internalType: 'uint256', name: 'gasLimit', type: 'uint256' },
                    { internalType: 'bytes', name: 'data', type: 'bytes' },
                    { internalType: 'string', name: 'memo', type: 'string' }
                ],
                internalType: 'struct IBridge.Message',
                name: 'message',
                type: 'tuple'
            }
        ],
        name: 'sendMessage',
        outputs: [
            { internalType: 'bytes32', name: 'msgHash', type: 'bytes32' },
            {
                components: [
                    { internalType: 'uint128', name: 'id', type: 'uint128' },
                    { internalType: 'address', name: 'from', type: 'address' },
                    { internalType: 'uint64', name: 'srcChainId', type: 'uint64' },
                    { internalType: 'uint64', name: 'destChainId', type: 'uint64' },
                    { internalType: 'address', name: 'owner', type: 'address' },
                    { internalType: 'address', name: 'to', type: 'address' },
                    { internalType: 'address', name: 'refundTo', type: 'address' },
                    { internalType: 'uint256', name: 'value', type: 'uint256' },
                    { internalType: 'uint256', name: 'fee', type: 'uint256' },
                    { internalType: 'uint256', name: 'gasLimit', type: 'uint256' },
                    { internalType: 'bytes', name: 'data', type: 'bytes' },
                    { internalType: 'string', name: 'memo', type: 'string' }
                ],
                internalType: 'struct IBridge.Message',
                name: '_message',
                type: 'tuple'
            }
        ],
        stateMutability: 'payable',
        type: 'function'
    }
];

export const taikoERC20BridgeABI: AbiItem[] = [
    {
        stateMutability: 'payable',
        type: 'function',
        inputs: [
            {
                name: 'opt',
                internalType: 'struct ERC20Vault.BridgeTransferOp',
                type: 'tuple',
                components: [
                    { name: 'destChainId', internalType: 'uint256', type: 'uint256' },
                    { name: 'to', internalType: 'address', type: 'address' },
                    { name: 'token', internalType: 'address', type: 'address' },
                    { name: 'amount', internalType: 'uint256', type: 'uint256' },
                    { name: 'gasLimit', internalType: 'uint256', type: 'uint256' },
                    { name: 'fee', internalType: 'uint256', type: 'uint256' },
                    { name: 'refundTo', internalType: 'address', type: 'address' },
                    { name: 'memo', internalType: 'string', type: 'string' }
                ]
            }
        ],
        name: 'sendToken',
        outputs: []
    }
];
