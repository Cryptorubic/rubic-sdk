import { AbiItem } from 'web3-utils';

export const UNI_V3_PERMIT2_ABI = [
    {
        inputs: [
            {
                internalType: 'address',
                name: 'owner',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'token',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'spender',
                type: 'address'
            }
        ],
        name: 'allowance',
        outputs: [
            {
                internalType: 'uint160',
                name: 'amount',
                type: 'uint160'
            },
            {
                internalType: 'uint48',
                name: 'expiration',
                type: 'uint48'
            },
            {
                internalType: 'uint48',
                name: 'nonce',
                type: 'uint48'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'token',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'spender',
                type: 'address'
            },
            {
                internalType: 'uint160',
                name: 'amount',
                type: 'uint160'
            },
            {
                internalType: 'uint48',
                name: 'expiration',
                type: 'uint48'
            }
        ],
        name: 'approve',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'owner',
                type: 'address'
            },
            {
                components: [
                    {
                        components: [
                            {
                                internalType: 'address',
                                name: 'token',
                                type: 'address'
                            },
                            {
                                internalType: 'uint160',
                                name: 'amount',
                                type: 'uint160'
                            },
                            {
                                internalType: 'uint48',
                                name: 'expiration',
                                type: 'uint48'
                            },
                            {
                                internalType: 'uint48',
                                name: 'nonce',
                                type: 'uint48'
                            }
                        ],
                        internalType: 'struct IAllowanceTransfer.PermitDetails',
                        name: 'details',
                        type: 'tuple'
                    },
                    {
                        internalType: 'address',
                        name: 'spender',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'sigDeadline',
                        type: 'uint256'
                    }
                ],
                internalType: 'struct IAllowanceTransfer.PermitSingle',
                name: 'permitSingle',
                type: 'tuple'
            },
            {
                internalType: 'bytes',
                name: 'signature',
                type: 'bytes'
            }
        ],
        name: 'permit',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                components: [
                    {
                        components: [
                            {
                                internalType: 'address',
                                name: 'token',
                                type: 'address'
                            },
                            {
                                internalType: 'uint256',
                                name: 'amount',
                                type: 'uint256'
                            }
                        ],
                        internalType: 'struct ISignatureTransfer.TokenPermissions',
                        name: 'permitted',
                        type: 'tuple'
                    },
                    {
                        internalType: 'uint256',
                        name: 'nonce',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'deadline',
                        type: 'uint256'
                    }
                ],
                internalType: 'struct ISignatureTransfer.PermitTransferFrom',
                name: 'permit',
                type: 'tuple'
            },
            {
                components: [
                    {
                        internalType: 'address',
                        name: 'to',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'requestedAmount',
                        type: 'uint256'
                    }
                ],
                internalType: 'struct ISignatureTransfer.SignatureTransferDetails',
                name: 'transferDetails',
                type: 'tuple'
            },
            {
                internalType: 'address',
                name: 'owner',
                type: 'address'
            },
            {
                internalType: 'bytes',
                name: 'signature',
                type: 'bytes'
            }
        ],
        name: 'permitTransferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    }
] as AbiItem[];
