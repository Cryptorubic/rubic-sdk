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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractTrade = void 0;
var cross_chain_contract_abi_v2_1 = require("./constants/cross-chain-contract-abi-v2");
var core_1 = require("../../../core");
var common_1 = require("../../../common");
var TO_OTHER_BLOCKCHAIN_SWAP_METHOD;
(function (TO_OTHER_BLOCKCHAIN_SWAP_METHOD) {
    TO_OTHER_BLOCKCHAIN_SWAP_METHOD["SWAP_TOKENS"] = "swapTokensToOtherBlockchain";
    TO_OTHER_BLOCKCHAIN_SWAP_METHOD["SWAP_CRYPTO"] = "swapCryptoToOtherBlockchain";
})(TO_OTHER_BLOCKCHAIN_SWAP_METHOD || (TO_OTHER_BLOCKCHAIN_SWAP_METHOD = {}));
var TO_USER_SWAP_METHOD;
(function (TO_USER_SWAP_METHOD) {
    TO_USER_SWAP_METHOD["SWAP_TOKENS"] = "swapTokensToUserWithFee";
    TO_USER_SWAP_METHOD["SWAP_CRYPTO"] = "swapCryptoToUserWithFee";
})(TO_USER_SWAP_METHOD || (TO_USER_SWAP_METHOD = {}));
var ContractTrade = /** @class */ (function () {
    function ContractTrade(blockchain, contract, providerIndex) {
        this.blockchain = blockchain;
        this.contract = contract;
        this.providerIndex = providerIndex;
    }
    Object.defineProperty(ContractTrade.prototype, "provider", {
        get: function () {
            return this.contract.providersData[this.providerIndex].provider;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ContractTrade.prototype, "providerData", {
        get: function () {
            return this.contract.providersData[this.providerIndex];
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns method's name and contract abi to call in source network.
     */
    ContractTrade.prototype.getMethodNameAndContractAbi = function () {
        var methodName = this.fromToken.isNative
            ? TO_OTHER_BLOCKCHAIN_SWAP_METHOD.SWAP_CRYPTO
            : TO_OTHER_BLOCKCHAIN_SWAP_METHOD.SWAP_TOKENS;
        var contractAbiMethod = __assign({}, cross_chain_contract_abi_v2_1.crossChainContractAbiV2.find(function (method) { return method.name === methodName; }));
        if (this.blockchain === core_1.BLOCKCHAIN_NAME.AVALANCHE) {
            methodName += 'AVAX';
        }
        methodName += this.providerData.methodSuffix;
        contractAbiMethod.name = methodName;
        return {
            methodName: methodName,
            contractAbi: [contractAbiMethod]
        };
    };
    /**
     * Returns method's arguments to use in source network.
     */
    ContractTrade.prototype.getMethodArguments = function (toContractTrade, walletAddress) {
        var tokenInAmountAbsolute = this.fromToken.weiAmount;
        var tokenOutAmountMinAbsolute = core_1.Web3Pure.toWei(toContractTrade.toTokenAmountMin, this.toToken.decimals);
        var fromTransitTokenAmountMinAbsolute = core_1.Web3Pure.toWei(this.toTokenAmountMin, this.toToken.decimals);
        var toNumOfBlockchain = toContractTrade.contract.getNumOfBlockchain();
        var firstPath = this.getFirstPath();
        var secondPath = toContractTrade.getSecondPath();
        var swapToUserMethodSignature = toContractTrade.getSwapToUserMethodSignature();
        return [
            [
                toNumOfBlockchain,
                tokenInAmountAbsolute,
                firstPath,
                secondPath,
                fromTransitTokenAmountMinAbsolute,
                tokenOutAmountMinAbsolute,
                core_1.Web3Pure.addressToBytes32(walletAddress),
                this.toToken.isNative,
                true,
                false,
                swapToUserMethodSignature
            ]
        ];
    };
    /**
     * Returns `signature` method argument, build from function name and its arguments.
     * Example: `${function_name_in_target_network}(${arguments})`.
     * Must be called on target contract.
     */
    ContractTrade.prototype.getSwapToUserMethodSignature = function () {
        var methodName = this.toToken.isNative
            ? TO_USER_SWAP_METHOD.SWAP_CRYPTO
            : TO_USER_SWAP_METHOD.SWAP_TOKENS;
        var contractAbiMethod = cross_chain_contract_abi_v2_1.crossChainContractAbiV2.find(function (method) { return method.name === methodName; });
        if (this.blockchain === core_1.BLOCKCHAIN_NAME.AVALANCHE) {
            methodName += 'AVAX';
        }
        methodName += this.providerData.methodSuffix;
        var parameters = contractAbiMethod.inputs[0].components;
        var paramsSignature = parameters.reduce(function (acc, parameter, index) {
            if (index === 0) {
                acc = '((';
            }
            acc += parameter.type;
            if (index === parameters.length - 1) {
                return "".concat(acc, "))");
            }
            return "".concat(acc, ",");
        }, '');
        return methodName + paramsSignature;
    };
    __decorate([
        common_1.Pure
    ], ContractTrade.prototype, "provider", null);
    __decorate([
        common_1.Pure
    ], ContractTrade.prototype, "providerData", null);
    return ContractTrade;
}());
exports.ContractTrade = ContractTrade;
//# sourceMappingURL=contract-trade.js.map