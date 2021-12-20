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
exports.UNISWAP_V2_PROVIDER_CONFIGURATION = exports.UNISWAP_ETHEREUM_CONTRACT_ADDRESS = void 0;
var default_constants_1 = require("../default-constants");
exports.UNISWAP_ETHEREUM_CONTRACT_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
exports.UNISWAP_V2_PROVIDER_CONFIGURATION = __assign(__assign({}, default_constants_1.defaultEthereumProviderConfiguration), { maxTransitTokens: 2 });
//# sourceMappingURL=constants.js.map