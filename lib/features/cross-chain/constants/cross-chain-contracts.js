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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCrossChainContract = exports.crossChainContractsData = void 0;
var BLOCKCHAIN_NAME_1 = require("../../../core/blockchain/models/BLOCKCHAIN_NAME");
var cross_chain_contract_data_1 = require("../contract-data/cross-chain-contract-data");
var pancake_swap_provider_1 = require("../../swap/dexes/bsc/pancake-swap/pancake-swap-provider");
var uni_swap_v2_provider_1 = require("../../swap/dexes/ethereum/uni-swap-v2/uni-swap-v2-provider");
var quick_swap_provider_1 = require("../../swap/dexes/polygon/quick-swap/quick-swap-provider");
var cross_chain_supported_blockchains_1 = require("./cross-chain-supported-blockchains");
var spooky_swap_provider_1 = require("../../swap/dexes/fantom/spooky-swap/spooky-swap-provider");
var joe_provider_1 = require("../../swap/dexes/avalanche/joe/joe-provider");
var solarbeam_provider_1 = require("../../swap/dexes/moonriver/solarbeam/solarbeam-provider");
var pangolin_provider_1 = require("../../swap/dexes/avalanche/pangolin/pangolin-provider");
/**
 * Stores contracts info.
 * Every contract may have several instant-trade providers.
 * Because of that every provider has `method suffix` - suffix
 * to add to default swap-method name to call that provider's method.
 */
exports.crossChainContractsData = (_a = {},
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.ETHEREUM] = {
        address: '0xD8b19613723215EF8CC80fC35A1428f8E8826940',
        providersData: [
            {
                ProviderClass: uni_swap_v2_provider_1.UniSwapV2Provider,
                methodSuffix: ''
            }
        ]
    },
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN] = {
        address: '0xEda6DdA4fD1581B6Ab8951750DB596566d0FBf9C',
        providersData: [
            {
                ProviderClass: pancake_swap_provider_1.PancakeSwapProvider,
                methodSuffix: ''
            }
        ]
    },
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.POLYGON] = {
        address: '0xe6625BBE80710C7Bb473721EdAC24Ce326940a6f',
        providersData: [
            {
                ProviderClass: quick_swap_provider_1.QuickSwapProvider,
                methodSuffix: ''
            }
        ]
    },
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.AVALANCHE] = {
        address: '0xd23B4dA264A756F427e13C72AB6cA5A6C95E4608',
        providersData: [
            {
                ProviderClass: pangolin_provider_1.PangolinProvider,
                methodSuffix: ''
            },
            {
                ProviderClass: joe_provider_1.JoeProvider,
                methodSuffix: '1'
            }
        ]
    },
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.MOONRIVER] = {
        address: '0xD8b19613723215EF8CC80fC35A1428f8E8826940',
        providersData: [
            {
                ProviderClass: solarbeam_provider_1.SolarbeamProvider,
                methodSuffix: ''
            }
        ]
    },
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.FANTOM] = {
        address: '0x55Be05ecC1c417B16163b000CB71DcE8526a5D06',
        providersData: [
            {
                ProviderClass: spooky_swap_provider_1.SpookySwapProvider,
                methodSuffix: ''
            }
        ]
    },
    _a);
var crossChainContracts = cross_chain_supported_blockchains_1.crossChainSupportedBlockchains.reduce(function (acc, blockchain) {
    var _a;
    return (__assign(__assign({}, acc), (_a = {}, _a[blockchain] = null, _a)));
}, {});
function getCrossChainContract(blockchain) {
    var storedContract = crossChainContracts[blockchain];
    if (storedContract) {
        return storedContract;
    }
    var contract = exports.crossChainContractsData[blockchain];
    crossChainContracts[blockchain] = new cross_chain_contract_data_1.CrossChainContractData(blockchain, contract.address, contract.providersData.map(function (providerData) { return ({
        provider: new providerData.ProviderClass(),
        methodSuffix: providerData.methodSuffix
    }); }));
    return crossChainContracts[blockchain];
}
exports.getCrossChainContract = getCrossChainContract;
//# sourceMappingURL=cross-chain-contracts.js.map