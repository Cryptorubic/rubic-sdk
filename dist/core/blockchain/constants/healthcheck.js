"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBlockchainHealthcheckAvailable = exports.healthcheckAvailableBlockchains = exports.HEALTHCHECK = void 0;
var erc_20_abi_1 = require("./erc-20-abi");
var BLOCKCHAIN_NAME_1 = require("../models/BLOCKCHAIN_NAME");
exports.HEALTHCHECK = (_a = {},
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.ETHEREUM] = {
        contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        contractAbi: erc_20_abi_1.ERC20_TOKEN_ABI,
        method: 'symbol',
        expected: 'USDT'
    },
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN] = {
        contractAddress: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
        contractAbi: erc_20_abi_1.ERC20_TOKEN_ABI,
        method: 'symbol',
        expected: 'BUSD'
    },
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.POLYGON] = {
        contractAddress: '0x7FFB3d637014488b63fb9858E279385685AFc1e2',
        contractAbi: erc_20_abi_1.ERC20_TOKEN_ABI,
        method: 'symbol',
        expected: 'USDT'
    },
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.HARMONY] = {
        contractAddress: '0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f',
        contractAbi: erc_20_abi_1.ERC20_TOKEN_ABI,
        method: 'symbol',
        expected: '1USDT'
    },
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.AVALANCHE] = {
        contractAddress: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
        contractAbi: erc_20_abi_1.ERC20_TOKEN_ABI,
        method: 'symbol',
        expected: 'USDT.e'
    },
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.MOONRIVER] = {
        contractAddress: '0xB44a9B6905aF7c801311e8F4E76932ee959c663C',
        contractAbi: erc_20_abi_1.ERC20_TOKEN_ABI,
        method: 'symbol',
        expected: 'USDT'
    },
    _a);
exports.healthcheckAvailableBlockchains = Object.keys(exports.HEALTHCHECK);
function isBlockchainHealthcheckAvailable(blockchainName) {
    return exports.healthcheckAvailableBlockchains.includes(blockchainName);
}
exports.isBlockchainHealthcheckAvailable = isBlockchainHealthcheckAvailable;
//# sourceMappingURL=healthcheck.js.map