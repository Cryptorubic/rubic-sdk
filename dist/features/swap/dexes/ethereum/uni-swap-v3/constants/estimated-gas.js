"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swapEstimatedGas = exports.WethToEthEstimatedGas = void 0;
var bignumber_js_1 = __importDefault(require("bignumber.js"));
exports.WethToEthEstimatedGas = new bignumber_js_1.default(36000);
exports.swapEstimatedGas = [
    new bignumber_js_1.default(110000),
    new bignumber_js_1.default(210000),
    new bignumber_js_1.default(310000)
];
//# sourceMappingURL=estimated-gas.js.map