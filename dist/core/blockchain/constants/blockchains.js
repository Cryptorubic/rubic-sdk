"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockchains = void 0;
var native_token_address_1 = require("./native-token-address");
var BLOCKCHAIN_NAME_1 = require("../models/BLOCKCHAIN_NAME");
var token_1 = require("../tokens/token");
exports.blockchains = [
    {
        id: 1,
        name: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.ETHEREUM,
        nativeCoin: new token_1.Token({
            blockchain: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.ETHEREUM,
            address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
        })
    },
    {
        id: 56,
        name: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        nativeCoin: new token_1.Token({
            blockchain: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
            address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
            name: 'Binance Coin',
            symbol: 'BNB',
            decimals: 18
        })
    },
    {
        id: 137,
        name: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.POLYGON,
        nativeCoin: new token_1.Token({
            blockchain: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.POLYGON,
            address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
            name: 'Matic Network',
            symbol: 'MATIC',
            decimals: 18
        })
    },
    {
        id: 1666600000,
        name: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.HARMONY,
        nativeCoin: new token_1.Token({
            blockchain: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.HARMONY,
            address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
            name: 'ONE',
            symbol: 'ONE',
            decimals: 18
        })
    },
    {
        id: 43114,
        name: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.AVALANCHE,
        nativeCoin: new token_1.Token({
            blockchain: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.AVALANCHE,
            address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
            name: 'AVAX',
            symbol: 'AVAX',
            decimals: 18
        })
    },
    {
        id: 1285,
        name: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.MOONRIVER,
        nativeCoin: new token_1.Token({
            blockchain: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.MOONRIVER,
            address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
            name: 'MOVR',
            symbol: 'MOVR',
            decimals: 18
        })
    },
    // Testnets
    {
        id: 42,
        name: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.KOVAN,
        nativeCoin: new token_1.Token({
            blockchain: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.KOVAN,
            address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
        })
    },
    {
        id: 97,
        name: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET,
        nativeCoin: new token_1.Token({
            blockchain: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET,
            address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
            name: 'Binance Coin',
            symbol: 'BNB',
            decimals: 18
        })
    },
    {
        id: 80001,
        name: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.POLYGON_TESTNET,
        nativeCoin: new token_1.Token({
            blockchain: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.POLYGON_TESTNET,
            address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
            name: 'Polygon',
            symbol: 'MATIC',
            decimals: 18
        })
    },
    {
        id: 1666700000,
        name: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.HARMONY_TESTNET,
        nativeCoin: new token_1.Token({
            blockchain: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.HARMONY_TESTNET,
            address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
            name: 'ONE',
            symbol: 'ONE',
            decimals: 18
        })
    },
    {
        id: 43113,
        name: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.AVALANCHE_TESTNET,
        nativeCoin: new token_1.Token({
            blockchain: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.AVALANCHE_TESTNET,
            address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
            name: 'AVAX',
            symbol: 'AVAX',
            decimals: 18
        })
    },
    {
        id: NaN,
        name: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.MOONRIVER_TESTNET,
        nativeCoin: new token_1.Token({
            blockchain: BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.MOONRIVER_TESTNET,
            address: native_token_address_1.NATIVE_TOKEN_ADDRESS,
            name: 'MOVR',
            symbol: 'MOVR',
            decimals: 18
        })
    }
];
//# sourceMappingURL=blockchains.js.map