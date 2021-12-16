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
exports.JOE_PROVIDER_CONFIGURATION = exports.JOE_CONTRACT_ADDRESS = void 0;
var default_constants_1 = require("../default-constants");
exports.JOE_CONTRACT_ADDRESS = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7';
var routingProvidersAddresses = [
    '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
    '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd',
    '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
    '0xd1c3f94DE7e5B45fa4eDBBA472491a9f4B166FC4',
    '0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5' // QI
];
exports.JOE_PROVIDER_CONFIGURATION = __assign(__assign({}, default_constants_1.defaultAvalancheProviderConfiguration), { routingProvidersAddresses: routingProvidersAddresses });
//# sourceMappingURL=constants.js.map