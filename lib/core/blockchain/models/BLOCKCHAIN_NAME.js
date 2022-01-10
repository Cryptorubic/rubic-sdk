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
exports.BLOCKCHAIN_NAME = exports.MAINNET_BLOCKCHAIN_NAME = exports.TESTNET_BLOCKCHAIN_NAME = void 0;
var TESTNET_BLOCKCHAIN_NAME;
(function (TESTNET_BLOCKCHAIN_NAME) {
    TESTNET_BLOCKCHAIN_NAME["KOVAN"] = "KOVAN";
    TESTNET_BLOCKCHAIN_NAME["BINANCE_SMART_CHAIN_TESTNET"] = "BSC_TESTNET";
    TESTNET_BLOCKCHAIN_NAME["POLYGON_TESTNET"] = "POLYGON_TESTNET";
    TESTNET_BLOCKCHAIN_NAME["HARMONY_TESTNET"] = "HARMONY_TESTNET";
    TESTNET_BLOCKCHAIN_NAME["AVALANCHE_TESTNET"] = "AVALANCHE_TESTNET";
    TESTNET_BLOCKCHAIN_NAME["MOONRIVER_TESTNET"] = "MOONRIVER_TESTNET";
    TESTNET_BLOCKCHAIN_NAME["FANTOM_TESTNET"] = "FANTOM_TESTNET";
})(TESTNET_BLOCKCHAIN_NAME = exports.TESTNET_BLOCKCHAIN_NAME || (exports.TESTNET_BLOCKCHAIN_NAME = {}));
var MAINNET_BLOCKCHAIN_NAME;
(function (MAINNET_BLOCKCHAIN_NAME) {
    MAINNET_BLOCKCHAIN_NAME["ETHEREUM"] = "ETH";
    MAINNET_BLOCKCHAIN_NAME["BINANCE_SMART_CHAIN"] = "BSC";
    MAINNET_BLOCKCHAIN_NAME["POLYGON"] = "POLYGON";
    MAINNET_BLOCKCHAIN_NAME["AVALANCHE"] = "AVALANCHE";
    MAINNET_BLOCKCHAIN_NAME["MOONRIVER"] = "MOONRIVER";
    MAINNET_BLOCKCHAIN_NAME["HARMONY"] = "HARMONY";
    MAINNET_BLOCKCHAIN_NAME["FANTOM"] = "FANTOM";
})(MAINNET_BLOCKCHAIN_NAME = exports.MAINNET_BLOCKCHAIN_NAME || (exports.MAINNET_BLOCKCHAIN_NAME = {}));
exports.BLOCKCHAIN_NAME = __assign(__assign({}, MAINNET_BLOCKCHAIN_NAME), TESTNET_BLOCKCHAIN_NAME);
//# sourceMappingURL=BLOCKCHAIN_NAME.js.map