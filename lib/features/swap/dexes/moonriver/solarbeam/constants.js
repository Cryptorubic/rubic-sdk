"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOLARBEAM_CONTRACT_ABI = exports.SOLARBEAM_PROVIDER_CONFIGURATION = exports.SOLARBEAM_CONTRACT_ADDRESS = void 0;
var default_constants_1 = require("../default-constants");
exports.SOLARBEAM_CONTRACT_ADDRESS = '0xAA30eF758139ae4a7f798112902Bf6d65612045f';
var routingProvidersAddresses = [
    '0x98878B06940aE243284CA214f92Bb71a2b032B8A',
    '0xB44a9B6905aF7c801311e8F4E76932ee959c663C',
    '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D',
    '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844',
    '0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818',
    '0x6bD193Ee6D2104F14F94E2cA6efefae561A4334B' // SOLAR
];
var wethAddress = '0xAA30eF758139ae4a7f798112902Bf6d65612045f';
exports.SOLARBEAM_PROVIDER_CONFIGURATION = __assign(__assign({}, default_constants_1.defaultMoonriverProviderConfiguration), { routingProvidersAddresses: routingProvidersAddresses, wethAddress: wethAddress });
exports.SOLARBEAM_CONTRACT_ABI = [
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'getAmountsIn',
        inputs: [
            { type: 'uint256', name: 'amountOut', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'uint256', name: 'fee', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'getAmountsOut',
        inputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'uint256', name: 'fee', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'swapExactETHForTokens',
        inputs: [
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'swapExactETHForTokensSupportingFeeOnTransferTokens',
        inputs: [
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'swapExactTokensForETH',
        inputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [],
        name: 'swapExactTokensForETHSupportingFeeOnTransferTokens',
        inputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'swapExactTokensForTokens',
        inputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [],
        name: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
        inputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    }
];
//# sourceMappingURL=constants.js.map