import { AbiItem } from 'web3-utils';

export const ntfCelerCrossChainContractAbi: AbiItem[] = [
    {
        inputs: [
            { internalType: 'uint256[]', name: '_blockchainIDs', type: 'uint256[]' },
            { internalType: 'uint256[]', name: '_cryptoFees', type: 'uint256[]' },
            { internalType: 'uint256[]', name: '_platformFees', type: 'uint256[]' },
            { internalType: 'address[]', name: '_tokens', type: 'address[]' },
            { internalType: 'uint256[]', name: '_minTokenAmounts', type: 'uint256[]' },
            { internalType: 'uint256[]', name: '_maxTokenAmounts', type: 'uint256[]' },
            { internalType: 'address[]', name: '_routers', type: 'address[]' },
            { internalType: 'address', name: '_executor', type: 'address' },
            { internalType: 'address', name: '_messageBus', type: 'address' },
            { internalType: 'address', name: '_nativeWrap', type: 'address' }
        ],
        stateMutability: 'nonpayable',
        type: 'constructor'
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
            { indexed: false, internalType: 'uint64', name: 'dstChainId', type: 'uint64' },
            { indexed: false, internalType: 'uint256', name: 'srcAmount', type: 'uint256' },
            { indexed: false, internalType: 'address', name: 'srcToken', type: 'address' }
        ],
        name: 'BridgeRequestSent',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, internalType: 'uint8', name: 'version', type: 'uint8' }],
        name: 'Initialized',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, internalType: 'address', name: 'messageBus', type: 'address' }],
        name: 'MessageBusUpdated',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: 'uint256', name: 'marketID', type: 'uint256' },
            { indexed: false, internalType: 'uint256', name: 'price', type: 'uint256' }
        ],
        name: 'NFTPurchased',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, internalType: 'address', name: 'account', type: 'address' }],
        name: 'Paused',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
            { indexed: true, internalType: 'bytes32', name: 'previousAdminRole', type: 'bytes32' },
            { indexed: true, internalType: 'bytes32', name: 'newAdminRole', type: 'bytes32' }
        ],
        name: 'RoleAdminChanged',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
            { indexed: true, internalType: 'address', name: 'account', type: 'address' },
            { indexed: true, internalType: 'address', name: 'sender', type: 'address' }
        ],
        name: 'RoleGranted',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
            { indexed: true, internalType: 'address', name: 'account', type: 'address' },
            { indexed: true, internalType: 'address', name: 'sender', type: 'address' }
        ],
        name: 'RoleRevoked',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
            { indexed: false, internalType: 'uint256', name: 'dstAmount', type: 'uint256' },
            {
                indexed: false,
                internalType: 'enum BridgeBase.SwapStatus',
                name: 'status',
                type: 'uint8'
            }
        ],
        name: 'SwapRequestDone',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
            { indexed: false, internalType: 'uint64', name: 'dstChainId', type: 'uint64' },
            { indexed: false, internalType: 'uint256', name: 'srcAmount', type: 'uint256' },
            { indexed: false, internalType: 'address', name: 'srcToken', type: 'address' }
        ],
        name: 'SwapRequestSentInch',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
            { indexed: false, internalType: 'uint64', name: 'dstChainId', type: 'uint64' },
            { indexed: false, internalType: 'uint256', name: 'srcAmount', type: 'uint256' },
            { indexed: false, internalType: 'address', name: 'srcToken', type: 'address' }
        ],
        name: 'SwapRequestSentV2',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, internalType: 'address', name: 'account', type: 'address' }],
        name: 'Unpaused',
        type: 'event'
    },
    { stateMutability: 'payable', type: 'fallback' },
    {
        inputs: [],
        name: 'DEFAULT_ADMIN_ROLE',
        outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'EXECUTOR_ROLE',
        outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'MANAGER_ROLE',
        outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'MPRegistry',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'RELAYER_ROLE',
        outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'SIGNATURE_LENGTH',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'VALIDATOR_ROLE',
        outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'address', name: '', type: 'address' }
        ],
        name: 'availableIntegratorFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'availableRubicFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'blockchainCryptoFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_receiver', type: 'address' },
            { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
            { internalType: 'uint64', name: '_dstChainId', type: 'uint64' },
            { internalType: 'address', name: '_srcBridgeToken', type: 'address' },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'bool', name: 'nativeOut', type: 'bool' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'enum SwapBase.SwapVersion', name: 'version', type: 'uint8' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'bytes', name: 'pathV3', type: 'bytes' },
                    {
                        components: [
                            { internalType: 'uint256', name: 'marketID', type: 'uint256' },
                            { internalType: 'uint256', name: 'value', type: 'uint256' },
                            { internalType: 'bytes', name: 'data', type: 'bytes' }
                        ],
                        internalType: 'struct SwapBase.NFTInfo',
                        name: 'NFTPurchaseInfo',
                        type: 'tuple'
                    },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoDest',
                name: '_dstSwap',
                type: 'tuple'
            },
            { internalType: 'uint32', name: '_maxBridgeSlippage', type: 'uint32' }
        ],
        name: 'bridgeWithSwap',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_receiver', type: 'address' },
            { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
            { internalType: 'uint64', name: '_dstChainId', type: 'uint64' },
            { internalType: 'address', name: '_srcBridgeToken', type: 'address' },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'bool', name: 'nativeOut', type: 'bool' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'enum SwapBase.SwapVersion', name: 'version', type: 'uint8' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'bytes', name: 'pathV3', type: 'bytes' },
                    {
                        components: [
                            { internalType: 'uint256', name: 'marketID', type: 'uint256' },
                            { internalType: 'uint256', name: 'value', type: 'uint256' },
                            { internalType: 'bytes', name: 'data', type: 'bytes' }
                        ],
                        internalType: 'struct SwapBase.NFTInfo',
                        name: 'NFTPurchaseInfo',
                        type: 'tuple'
                    },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoDest',
                name: '_dstSwap',
                type: 'tuple'
            },
            { internalType: 'uint32', name: '_maxBridgeSlippage', type: 'uint32' }
        ],
        name: 'bridgeWithSwapNative',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'bytes32', name: '_id', type: 'bytes32' },
            { internalType: 'enum BridgeBase.SwapStatus', name: '_statusCode', type: 'uint8' }
        ],
        name: 'changeTxStatus',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address payable', name: '_to', type: 'address' }],
        name: 'collectCryptoFee',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '_token', type: 'address' }],
        name: 'collectIntegratorFee',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_token', type: 'address' },
            { internalType: 'address', name: '_integrator', type: 'address' }
        ],
        name: 'collectIntegratorFee',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '_token', type: 'address' }],
        name: 'collectRubicFee',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'bytes32', name: 'hash', type: 'bytes32' },
            { internalType: 'bytes', name: 'signature', type: 'bytes' },
            { internalType: 'uint256', name: 'offset', type: 'uint256' }
        ],
        name: 'ecOffsetRecover',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'pure',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_sender', type: 'address' },
            { internalType: 'uint64', name: '_srcChainId', type: 'uint64' },
            { internalType: 'bytes', name: '_message', type: 'bytes' },
            { internalType: 'address', name: '_executor', type: 'address' }
        ],
        name: 'executeMessage',
        outputs: [
            { internalType: 'enum IMessageReceiverApp.ExecutionStatus', name: '', type: 'uint8' }
        ],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'address', name: '_token', type: 'address' },
            { internalType: 'uint256', name: '_amount', type: 'uint256' },
            { internalType: 'uint64', name: '_srcChainId', type: 'uint64' },
            { internalType: 'bytes', name: '_message', type: 'bytes' },
            { internalType: 'address', name: '_executor', type: 'address' }
        ],
        name: 'executeMessageWithTransfer',
        outputs: [
            { internalType: 'enum IMessageReceiverApp.ExecutionStatus', name: '', type: 'uint8' }
        ],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'uint256', name: '_amount', type: 'uint256' },
            { internalType: 'uint64', name: '_srcChainId', type: 'uint64' },
            { internalType: 'bytes', name: '_message', type: 'bytes' },
            { internalType: 'address', name: '_executor', type: 'address' }
        ],
        name: 'executeMessageWithTransferFallback',
        outputs: [
            { internalType: 'enum IMessageReceiverApp.ExecutionStatus', name: '', type: 'uint8' }
        ],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_token', type: 'address' },
            { internalType: 'uint256', name: '_amount', type: 'uint256' },
            { internalType: 'bytes', name: '_message', type: 'bytes' },
            { internalType: 'address', name: '_executor', type: 'address' }
        ],
        name: 'executeMessageWithTransferRefund',
        outputs: [
            { internalType: 'enum IMessageReceiverApp.ExecutionStatus', name: '', type: 'uint8' }
        ],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'feeAmountOfBlockchain',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'getAvailableRouters',
        outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: 'user', type: 'address' },
            { internalType: 'uint256', name: 'amountWithFee', type: 'uint256' },
            { internalType: 'bytes32', name: 'originalTxHash', type: 'bytes32' },
            { internalType: 'uint256', name: 'blockchainNum', type: 'uint256' }
        ],
        name: 'getHashPacked',
        outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
        stateMutability: 'pure',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }],
        name: 'getRoleAdmin',
        outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'bytes32', name: 'role', type: 'bytes32' },
            { internalType: 'address', name: 'account', type: 'address' }
        ],
        name: 'grantRole',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'bytes32', name: 'role', type: 'bytes32' },
            { internalType: 'address', name: 'account', type: 'address' }
        ],
        name: 'hasRole',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'integratorFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '_who', type: 'address' }],
        name: 'isAdmin',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '_who', type: 'address' }],
        name: 'isManager',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '_who', type: 'address' }],
        name: 'isRelayer',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '_who', type: 'address' }],
        name: 'isValidator',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'bytes32', name: '_id', type: 'bytes32' },
            { internalType: 'address', name: '_token', type: 'address' },
            { internalType: 'uint256', name: '_amount', type: 'uint256' },
            { internalType: 'address', name: '_to', type: 'address' },
            { internalType: 'bool', name: '_nativeOut', type: 'bool' }
        ],
        name: 'manualRefund',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'maxTokenAmount',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'messageBus',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'minConfirmationSignatures',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'minTokenAmount',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'nativeWrap',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'nonce',
        outputs: [{ internalType: 'uint64', name: '', type: 'uint64' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'pauseExecution',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'paused',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'platformShare',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
        name: 'processedTransactions',
        outputs: [{ internalType: 'enum BridgeBase.SwapStatus', name: '', type: 'uint8' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'bytes32', name: 'role', type: 'bytes32' },
            { internalType: 'address', name: 'account', type: 'address' }
        ],
        name: 'renounceRole',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'bytes32', name: 'role', type: 'bytes32' },
            { internalType: 'address', name: 'account', type: 'address' }
        ],
        name: 'revokeRole',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: '_blockchainID', type: 'uint256' },
            { internalType: 'uint256', name: '_feeAmount', type: 'uint256' }
        ],
        name: 'setCryptoFeeOfBlockchain',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: '_blockchainID', type: 'uint256' },
            { internalType: 'uint256', name: '_feeAmount', type: 'uint256' }
        ],
        name: 'setFeeAmountOfBlockchain',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_integrator', type: 'address' },
            { internalType: 'uint256', name: '_fee', type: 'uint256' },
            { internalType: 'uint256', name: '_platformShare', type: 'uint256' }
        ],
        name: 'setIntegratorFee',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint256', name: '_marketID', type: 'uint256' },
            { internalType: 'address', name: '_implementation', type: 'address' }
        ],
        name: 'setMPRegistry',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_token', type: 'address' },
            { internalType: 'uint256', name: '_maxTokenAmount', type: 'uint256' }
        ],
        name: 'setMaxTokenAmount',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '_messageBus', type: 'address' }],
        name: 'setMessageBus',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'uint256', name: '_minConfirmationSignatures', type: 'uint256' }],
        name: 'setMinConfirmationSignatures',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_token', type: 'address' },
            { internalType: 'uint256', name: '_minTokenAmount', type: 'uint256' }
        ],
        name: 'setMinTokenAmount',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '_nativeWrap', type: 'address' }],
        name: 'setNativeWrap',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
        name: 'supportsInterface',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_token', type: 'address' },
            { internalType: 'uint256', name: '_amount', type: 'uint256' }
        ],
        name: 'sweepTokens',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'bytes32', name: 'hash', type: 'bytes32' }],
        name: 'toEthSignedMessageHash',
        outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
        stateMutability: 'pure',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '_newAdmin', type: 'address' }],
        name: 'transferAdmin',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_receiver', type: 'address' },
            { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
            { internalType: 'uint64', name: '_dstChainId', type: 'uint64' },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'bytes', name: 'data', type: 'bytes' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoInch',
                name: '_srcSwap',
                type: 'tuple'
            },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'bool', name: 'nativeOut', type: 'bool' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'enum SwapBase.SwapVersion', name: 'version', type: 'uint8' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'bytes', name: 'pathV3', type: 'bytes' },
                    {
                        components: [
                            { internalType: 'uint256', name: 'marketID', type: 'uint256' },
                            { internalType: 'uint256', name: 'value', type: 'uint256' },
                            { internalType: 'bytes', name: 'data', type: 'bytes' }
                        ],
                        internalType: 'struct SwapBase.NFTInfo',
                        name: 'NFTPurchaseInfo',
                        type: 'tuple'
                    },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoDest',
                name: '_dstSwap',
                type: 'tuple'
            },
            { internalType: 'uint32', name: '_maxBridgeSlippage', type: 'uint32' }
        ],
        name: 'transferWithSwapInch',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_receiver', type: 'address' },
            { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
            { internalType: 'uint64', name: '_dstChainId', type: 'uint64' },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'bytes', name: 'data', type: 'bytes' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoInch',
                name: '_srcSwap',
                type: 'tuple'
            },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'bool', name: 'nativeOut', type: 'bool' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'enum SwapBase.SwapVersion', name: 'version', type: 'uint8' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'bytes', name: 'pathV3', type: 'bytes' },
                    {
                        components: [
                            { internalType: 'uint256', name: 'marketID', type: 'uint256' },
                            { internalType: 'uint256', name: 'value', type: 'uint256' },
                            { internalType: 'bytes', name: 'data', type: 'bytes' }
                        ],
                        internalType: 'struct SwapBase.NFTInfo',
                        name: 'NFTPurchaseInfo',
                        type: 'tuple'
                    },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoDest',
                name: '_dstSwap',
                type: 'tuple'
            },
            { internalType: 'uint32', name: '_maxBridgeSlippage', type: 'uint32' }
        ],
        name: 'transferWithSwapInchNative',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_receiver', type: 'address' },
            { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
            { internalType: 'uint64', name: '_dstChainId', type: 'uint64' },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoV2',
                name: '_srcSwap',
                type: 'tuple'
            },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'bool', name: 'nativeOut', type: 'bool' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'enum SwapBase.SwapVersion', name: 'version', type: 'uint8' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'bytes', name: 'pathV3', type: 'bytes' },
                    {
                        components: [
                            { internalType: 'uint256', name: 'marketID', type: 'uint256' },
                            { internalType: 'uint256', name: 'value', type: 'uint256' },
                            { internalType: 'bytes', name: 'data', type: 'bytes' }
                        ],
                        internalType: 'struct SwapBase.NFTInfo',
                        name: 'NFTPurchaseInfo',
                        type: 'tuple'
                    },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoDest',
                name: '_dstSwap',
                type: 'tuple'
            },
            { internalType: 'uint32', name: '_maxBridgeSlippage', type: 'uint32' }
        ],
        name: 'transferWithSwapV2',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_receiver', type: 'address' },
            { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
            { internalType: 'uint64', name: '_dstChainId', type: 'uint64' },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoV2',
                name: '_srcSwap',
                type: 'tuple'
            },
            {
                components: [
                    { internalType: 'address', name: 'dex', type: 'address' },
                    { internalType: 'bool', name: 'nativeOut', type: 'bool' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'enum SwapBase.SwapVersion', name: 'version', type: 'uint8' },
                    { internalType: 'address[]', name: 'path', type: 'address[]' },
                    { internalType: 'bytes', name: 'pathV3', type: 'bytes' },
                    {
                        components: [
                            { internalType: 'uint256', name: 'marketID', type: 'uint256' },
                            { internalType: 'uint256', name: 'value', type: 'uint256' },
                            { internalType: 'bytes', name: 'data', type: 'bytes' }
                        ],
                        internalType: 'struct SwapBase.NFTInfo',
                        name: 'NFTPurchaseInfo',
                        type: 'tuple'
                    },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
                ],
                internalType: 'struct SwapBase.SwapInfoDest',
                name: '_dstSwap',
                type: 'tuple'
            },
            { internalType: 'uint32', name: '_maxBridgeSlippage', type: 'uint32' }
        ],
        name: 'transferWithSwapV2Native',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'unpauseExecution',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    { stateMutability: 'payable', type: 'receive' }
] as AbiItem[];
