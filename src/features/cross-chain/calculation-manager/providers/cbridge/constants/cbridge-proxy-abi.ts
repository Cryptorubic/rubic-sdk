import { AbiItem } from 'web3-utils';

export const cbridgeProxyAbi: AbiItem[] = [
    {
        inputs: [
            { internalType: 'uint256', name: '_fixedCryptoFee', type: 'uint256' },
            { internalType: 'uint256', name: '_rubicPlatformFee', type: 'uint256' },
            { internalType: 'address[]', name: '_tokens', type: 'address[]' },
            { internalType: 'uint256[]', name: '_minTokenAmounts', type: 'uint256[]' },
            { internalType: 'uint256[]', name: '_maxTokenAmounts', type: 'uint256[]' },
            { internalType: 'address', name: '_admin', type: 'address' },
            {
                internalType: 'contract IRubicWhitelist',
                name: '_whitelistRegistry',
                type: 'address'
            },
            { internalType: 'contract IcBridge', name: '_cBridge', type: 'address' }
        ],
        stateMutability: 'nonpayable',
        type: 'constructor'
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: 'address', name: 'adminShifter', type: 'address' },
            { indexed: false, internalType: 'address', name: 'newAdmin', type: 'address' }
        ],
        name: 'AcceptAdmin',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: 'uint256', name: 'RubicPart', type: 'uint256' },
            { indexed: false, internalType: 'uint256', name: 'integratorPart', type: 'uint256' },
            { indexed: true, internalType: 'address', name: 'integrator', type: 'address' }
        ],
        name: 'FixedCryptoFee',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
            { indexed: false, internalType: 'address', name: 'collector', type: 'address' }
        ],
        name: 'FixedCryptoFeeCollected',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: 'address', name: 'admintShifter', type: 'address' },
            { indexed: false, internalType: 'address', name: 'newAdmin', type: 'address' }
        ],
        name: 'InitAdminTransfer',
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
        inputs: [
            { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
            { indexed: true, internalType: 'address', name: 'integrator', type: 'address' },
            { indexed: false, internalType: 'address', name: 'token', type: 'address' }
        ],
        name: 'IntegratorTokenFeeCollected',
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
            {
                components: [
                    { internalType: 'address', name: 'srcInputToken', type: 'address' },
                    { internalType: 'uint256', name: 'srcInputAmount', type: 'uint256' },
                    { internalType: 'uint256', name: 'dstChainID', type: 'uint256' },
                    { internalType: 'address', name: 'dstOutputToken', type: 'address' },
                    { internalType: 'uint256', name: 'dstMinOutputAmount', type: 'uint256' },
                    { internalType: 'address', name: 'recipient', type: 'address' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'address', name: 'router', type: 'address' }
                ],
                indexed: false,
                internalType: 'struct BridgeBase.BaseCrossChainParams',
                name: 'parameters',
                type: 'tuple'
            },
            { indexed: false, internalType: 'string', name: 'providerName', type: 'string' }
        ],
        name: 'RequestSent',
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
            { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
            { indexed: false, internalType: 'address', name: 'token', type: 'address' }
        ],
        name: 'RubicTokenFeeCollected',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, internalType: 'uint256', name: 'fee', type: 'uint256' }],
        name: 'SetFixedCryptoFee',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, internalType: 'uint256', name: 'fee', type: 'uint256' }],
        name: 'SetRubicPlatformFee',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: 'address', name: 'token', type: 'address' },
            { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
            { indexed: false, internalType: 'address', name: 'recipient', type: 'address' }
        ],
        name: 'SweepTokens',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: 'uint256', name: 'RubicPart', type: 'uint256' },
            { indexed: false, internalType: 'uint256', name: 'integratorPart', type: 'uint256' },
            { indexed: true, internalType: 'address', name: 'integrator', type: 'address' },
            { indexed: false, internalType: 'address', name: 'token', type: 'address' }
        ],
        name: 'TokenFee',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, internalType: 'address', name: 'account', type: 'address' }],
        name: 'Unpaused',
        type: 'event'
    },
    { stateMutability: 'nonpayable', type: 'fallback' },
    {
        inputs: [],
        name: 'DEFAULT_ADMIN_ROLE',
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
        inputs: [],
        name: 'RubicPlatformFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'acceptAdmin',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'availableIntegratorCryptoFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'address', name: '', type: 'address' }
        ],
        name: 'availableIntegratorTokenFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'availableRubicCryptoFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'availableRubicTokenFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint32', name: '_maxSlippage', type: 'uint32' },
            {
                components: [
                    { internalType: 'address', name: 'srcInputToken', type: 'address' },
                    { internalType: 'uint256', name: 'srcInputAmount', type: 'uint256' },
                    { internalType: 'uint256', name: 'dstChainID', type: 'uint256' },
                    { internalType: 'address', name: 'dstOutputToken', type: 'address' },
                    { internalType: 'uint256', name: 'dstMinOutputAmount', type: 'uint256' },
                    { internalType: 'address', name: 'recipient', type: 'address' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'address', name: 'router', type: 'address' }
                ],
                internalType: 'struct BridgeBase.BaseCrossChainParams',
                name: '_params',
                type: 'tuple'
            }
        ],
        name: 'bridge',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'uint32', name: '_maxSlippage', type: 'uint32' },
            {
                components: [
                    { internalType: 'address', name: 'srcInputToken', type: 'address' },
                    { internalType: 'uint256', name: 'srcInputAmount', type: 'uint256' },
                    { internalType: 'uint256', name: 'dstChainID', type: 'uint256' },
                    { internalType: 'address', name: 'dstOutputToken', type: 'address' },
                    { internalType: 'uint256', name: 'dstMinOutputAmount', type: 'uint256' },
                    { internalType: 'address', name: 'recipient', type: 'address' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'address', name: 'router', type: 'address' }
                ],
                internalType: 'struct BridgeBase.BaseCrossChainParams',
                name: '_params',
                type: 'tuple'
            }
        ],
        name: 'bridgeNative',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'cBridge',
        outputs: [{ internalType: 'contract IcBridge', name: '', type: 'address' }],
        stateMutability: 'view',
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
            { internalType: 'address', name: '_integrator', type: 'address' },
            { internalType: 'address', name: '_token', type: 'address' }
        ],
        name: 'collectIntegratorFee',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '_recipient', type: 'address' }],
        name: 'collectRubicCryptoFee',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_token', type: 'address' },
            { internalType: 'address', name: '_recipient', type: 'address' }
        ],
        name: 'collectRubicFee',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'fixedCryptoFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
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
        name: 'integratorToFeeInfo',
        outputs: [
            { internalType: 'bool', name: 'isIntegrator', type: 'bool' },
            { internalType: 'uint32', name: 'tokenFee', type: 'uint32' },
            { internalType: 'uint32', name: 'RubicTokenShare', type: 'uint32' },
            { internalType: 'uint32', name: 'RubicFixedCryptoShare', type: 'uint32' },
            { internalType: 'uint128', name: 'fixedFeeAmount', type: 'uint128' }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'maxRubicPlatformFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
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
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'minTokenAmount',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
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
        inputs: [{ internalType: 'uint256', name: '_fixedCryptoFee', type: 'uint256' }],
        name: 'setFixedCryptoFee',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_integrator', type: 'address' },
            {
                components: [
                    { internalType: 'bool', name: 'isIntegrator', type: 'bool' },
                    { internalType: 'uint32', name: 'tokenFee', type: 'uint32' },
                    { internalType: 'uint32', name: 'RubicTokenShare', type: 'uint32' },
                    { internalType: 'uint32', name: 'RubicFixedCryptoShare', type: 'uint32' },
                    { internalType: 'uint128', name: 'fixedFeeAmount', type: 'uint128' }
                ],
                internalType: 'struct BridgeBase.IntegratorFeeInfo',
                name: '_info',
                type: 'tuple'
            }
        ],
        name: 'setIntegratorInfo',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'uint256', name: '_maxFee', type: 'uint256' }],
        name: 'setMaxRubicPlatformFee',
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
        inputs: [{ internalType: 'uint256', name: '_platformFee', type: 'uint256' }],
        name: 'setRubicPlatformFee',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'contract IRubicWhitelist',
                name: '_newWhitelistRegistry',
                type: 'address'
            }
        ],
        name: 'setWhitelistRegistry',
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
            { internalType: 'address', name: '_tokenOut', type: 'address' },
            { internalType: 'bytes', name: '_swapData', type: 'bytes' },
            { internalType: 'uint32', name: '_maxSlippage', type: 'uint32' },
            {
                components: [
                    { internalType: 'address', name: 'srcInputToken', type: 'address' },
                    { internalType: 'uint256', name: 'srcInputAmount', type: 'uint256' },
                    { internalType: 'uint256', name: 'dstChainID', type: 'uint256' },
                    { internalType: 'address', name: 'dstOutputToken', type: 'address' },
                    { internalType: 'uint256', name: 'dstMinOutputAmount', type: 'uint256' },
                    { internalType: 'address', name: 'recipient', type: 'address' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'address', name: 'router', type: 'address' }
                ],
                internalType: 'struct BridgeBase.BaseCrossChainParams',
                name: '_params',
                type: 'tuple'
            }
        ],
        name: 'swapAndBridge',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_tokenOut', type: 'address' },
            { internalType: 'bytes', name: '_swapData', type: 'bytes' },
            { internalType: 'uint32', name: '_maxSlippage', type: 'uint32' },
            {
                components: [
                    { internalType: 'address', name: 'srcInputToken', type: 'address' },
                    { internalType: 'uint256', name: 'srcInputAmount', type: 'uint256' },
                    { internalType: 'uint256', name: 'dstChainID', type: 'uint256' },
                    { internalType: 'address', name: 'dstOutputToken', type: 'address' },
                    { internalType: 'uint256', name: 'dstMinOutputAmount', type: 'uint256' },
                    { internalType: 'address', name: 'recipient', type: 'address' },
                    { internalType: 'address', name: 'integrator', type: 'address' },
                    { internalType: 'address', name: 'router', type: 'address' }
                ],
                internalType: 'struct BridgeBase.BaseCrossChainParams',
                name: '_params',
                type: 'tuple'
            }
        ],
        name: 'swapNativeAndBridge',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: '_token', type: 'address' },
            { internalType: 'uint256', name: '_amount', type: 'uint256' },
            { internalType: 'address', name: '_recipient', type: 'address' }
        ],
        name: 'sweepTokens',
        outputs: [],
        stateMutability: 'nonpayable',
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
        inputs: [],
        name: 'unpauseExecution',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'whitelistRegistry',
        outputs: [{ internalType: 'contract IRubicWhitelist', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    },
    { stateMutability: 'payable', type: 'receive' }
];
