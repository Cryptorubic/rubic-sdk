"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.nativeTokensList = void 0;
var native_token_address_1 = require("./native-token-address");
var BLOCKCHAIN_NAME_1 = require("../models/BLOCKCHAIN_NAME");
exports.nativeTokensList = (_a = {},
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.ETHEREUM] = {
        address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
    },
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN] = {
        address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
        name: 'Binance Coin',
        symbol: 'BNB',
        decimals: 18
    },
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.POLYGON] = {
        address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
        name: 'Matic Network',
        symbol: 'MATIC',
        decimals: 18
    },
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.AVALANCHE] = {
        address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
        name: 'AVAX',
        symbol: 'AVAX',
        decimals: 18
    },
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.MOONRIVER] = {
        address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
        name: 'MOVR',
        symbol: 'MOVR',
        decimals: 18
    },
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.HARMONY] = {
        address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
        name: 'ONE',
        symbol: 'ONE',
        decimals: 18
    },
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.FANTOM] = {
        address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
        name: 'FTM',
        symbol: 'FTM',
        decimals: 18
    },
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.KOVAN] = {
        address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
    },
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET] = {
        address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
        name: 'Binance Coin',
        symbol: 'BNB',
        decimals: 18
    },
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.POLYGON_TESTNET] = {
        address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
        name: 'Matic Network',
        symbol: 'MATIC',
        decimals: 18
    },
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.AVALANCHE_TESTNET] = {
        address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
        name: 'AVAX',
        symbol: 'AVAX',
        decimals: 18
    },
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.MOONRIVER_TESTNET] = {
        address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
        name: 'MOVR',
        symbol: 'MOVR',
        decimals: 18
    },
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.HARMONY_TESTNET] = {
        address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
        name: 'ONE',
        symbol: 'ONE',
        decimals: 18
    },
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.FANTOM_TESTNET] = {
        address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
        name: 'FTM',
        symbol: 'FTM',
        decimals: 18
    },
    _a);
//# sourceMappingURL=native-tokens.js.map