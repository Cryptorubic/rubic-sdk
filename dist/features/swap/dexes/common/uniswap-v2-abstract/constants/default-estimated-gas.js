"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultEstimatedGas = void 0;
var bignumber_js_1 = __importDefault(require("bignumber.js"));
exports.defaultEstimatedGas = {
    tokensToTokens: [
        new bignumber_js_1.default(120000),
        new bignumber_js_1.default(220000),
        new bignumber_js_1.default(300000),
        new bignumber_js_1.default(400000)
    ],
    tokensToEth: [
        new bignumber_js_1.default(150000),
        new bignumber_js_1.default(240000),
        new bignumber_js_1.default(320000),
        new bignumber_js_1.default(400000)
    ],
    ethToTokens: [
        new bignumber_js_1.default(150000),
        new bignumber_js_1.default(240000),
        new bignumber_js_1.default(320000),
        new bignumber_js_1.default(400000)
    ]
};
//# sourceMappingURL=default-estimated-gas.js.map