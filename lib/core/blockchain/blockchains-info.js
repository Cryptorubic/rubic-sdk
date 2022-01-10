"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainsInfo = void 0;
var blockchains_1 = require("./constants/blockchains");
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var BlockchainsInfo = /** @class */ (function () {
    function BlockchainsInfo() {
    }
    BlockchainsInfo.getBlockchainById = function (chainId) {
        var chainIdNumber = new bignumber_js_1.default(chainId).toNumber();
        return BlockchainsInfo.blockchains.find(function (blockchain) { return blockchain.id === chainIdNumber; });
    };
    BlockchainsInfo.getBlockchainByName = function (blockchainName) {
        return BlockchainsInfo.blockchains.find(function (blockchain) { return blockchain.name === blockchainName; });
    };
    BlockchainsInfo.blockchains = blockchains_1.blockchains;
    return BlockchainsInfo;
}());
exports.BlockchainsInfo = BlockchainsInfo;
//# sourceMappingURL=blockchains-info.js.map