"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.crossChainContracts = void 0;
var BLOCKCHAIN_NAME_1 = require("@core/blockchain/models/BLOCKCHAIN_NAME");
var cross_chain_contract_1 = require("@features/cross-chain/cross-chain-contract/cross-chain-contract");
var pancake_swap_provider_1 = require("@features/swap/dexes/bsc/pancake-swap/pancake-swap-provider");
var uni_swap_v2_provider_1 = require("@features/swap/dexes/ethereum/uni-swap-v2/uni-swap-v2-provider");
var quick_swap_provider_1 = require("@features/swap/dexes/polygon/quick-swap/quick-swap-provider");
var spooky_swap_provider_1 = require("@features/swap/dexes/fantom/spooky-swap/spooky-swap-provider");
var joe_provider_1 = require("@features/swap/dexes/avalanche/joe/joe-provider");
var solarbeam_provider_1 = require("@features/swap/dexes/moonriver/solarbeam/solarbeam-provider");
var pangolin_provider_1 = require("@features/swap/dexes/avalanche/pangolin/pangolin-provider");
exports.crossChainContracts = (_a = {},
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.ETHEREUM] = [
        new cross_chain_contract_1.CrossChainContract(BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.ETHEREUM, '0xb9a94be803eC1197A234406eF5c0113f503d3178', new uni_swap_v2_provider_1.UniSwapV2Provider())
    ],
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN] = [
        new cross_chain_contract_1.CrossChainContract(BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN, '0x6b8904739059afbaa91311aab99187f5885c6dc0', new pancake_swap_provider_1.PancakeSwapProvider())
    ],
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.POLYGON] = [
        new cross_chain_contract_1.CrossChainContract(BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.POLYGON, '0xb02c0b6ba0e7719de2d44e613fc4ad01ac2f60ad', new quick_swap_provider_1.QuickSwapProvider())
    ],
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.AVALANCHE] = [
        new cross_chain_contract_1.CrossChainContract(BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.AVALANCHE, '0x3df5f6165fe8429744F9488a9C18259E9a93B4C0', new pangolin_provider_1.PangolinProvider()),
        new cross_chain_contract_1.CrossChainContract(BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.AVALANCHE, '0x9375e3B9623610919750257C3A8667A62533bc93', new joe_provider_1.JoeProvider())
    ],
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.MOONRIVER] = [
        new cross_chain_contract_1.CrossChainContract(BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.MOONRIVER, '0x3645Dca27D9f5Cf5ee0d6f52EE53ae366e4ceAc2', new solarbeam_provider_1.SolarbeamProvider())
    ],
    _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.FANTOM] = [
        new cross_chain_contract_1.CrossChainContract(BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.FANTOM, '0xeDfA29ca1BdbFaCBBDc6AAda385c983020015177', new spooky_swap_provider_1.SpookySwapProvider())
    ],
    _a);
//# sourceMappingURL=crossChainContracts.js.map