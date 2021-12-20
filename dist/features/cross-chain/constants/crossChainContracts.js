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
var cross_chain_contract_1 = require("../cross-chain-contract/cross-chain-contract");
var pancake_swap_provider_1 = require("../../swap/dexes/bsc/pancake-swap/pancake-swap-provider");
var uni_swap_v2_provider_1 = require("../../swap/dexes/ethereum/uni-swap-v2/uni-swap-v2-provider");
var quick_swap_provider_1 = require("../../swap/dexes/polygon/quick-swap/quick-swap-provider");
var CrossChainSupportedBlockchains_1 = require("./CrossChainSupportedBlockchains");
var spooky_swap_provider_1 = require("../../swap/dexes/fantom/spooky-swap/spooky-swap-provider");
var joe_provider_1 = require("../../swap/dexes/avalanche/joe/joe-provider");
var solarbeam_provider_1 = require("../../swap/dexes/moonriver/solarbeam/solarbeam-provider");
var pangolin_provider_1 = require("../../swap/dexes/avalanche/pangolin/pangolin-provider");
exports.crossChainContractsData = (_a = {},
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.ETHEREUM] = [
        {
            address: '0xb9a94be803eC1197A234406eF5c0113f503d3178',
            Provider: uni_swap_v2_provider_1.UniSwapV2Provider
        }
    ],
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN] = [
        {
            address: '0x6b8904739059afbaa91311aab99187f5885c6dc0',
            Provider: pancake_swap_provider_1.PancakeSwapProvider
        }
    ],
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.POLYGON] = [
        {
            address: '0xb02c0b6ba0e7719de2d44e613fc4ad01ac2f60ad',
            Provider: quick_swap_provider_1.QuickSwapProvider
        }
    ],
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.AVALANCHE] = [
        {
            address: '0x3df5f6165fe8429744F9488a9C18259E9a93B4C0',
            Provider: pangolin_provider_1.PangolinProvider
        },
        {
            address: '0x9375e3B9623610919750257C3A8667A62533bc93',
            Provider: joe_provider_1.JoeProvider
        }
    ],
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.MOONRIVER] = [
        {
            address: '0x3645Dca27D9f5Cf5ee0d6f52EE53ae366e4ceAc2',
            Provider: solarbeam_provider_1.SolarbeamProvider
        }
    ],
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.FANTOM] = [
        {
            address: '0xeDfA29ca1BdbFaCBBDc6AAda385c983020015177',
            Provider: spooky_swap_provider_1.SpookySwapProvider
        }
    ],
    _a);
var crossChainContracts = CrossChainSupportedBlockchains_1.crossChainSupportedBlockchains.reduce(function (acc, blockchain) {
    var _a;
    return (__assign(__assign({}, acc), (_a = {}, _a[blockchain] = null, _a)));
}, {});
function getCrossChainContract(blockchain) {
    var storedContract = crossChainContracts[blockchain];
    if (storedContract) {
        return storedContract;
    }
    var contractCreationData = exports.crossChainContractsData[blockchain];
    var contracts = contractCreationData.map(function (data) { return new cross_chain_contract_1.CrossChainContract(blockchain, data.address, new data.Provider()); });
    crossChainContracts[blockchain] = contracts;
    return contracts;
}
exports.getCrossChainContract = getCrossChainContract;
//# sourceMappingURL=crossChainContracts.js.map