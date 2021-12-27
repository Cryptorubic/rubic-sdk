"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstantTradeContractTrade = void 0;
var contract_trade_1 = require("./contract-trade");
var pure_decorator_1 = require("../../../common/decorators/pure.decorator");
var core_1 = require("../../../core");
var InstantTradeContractTrade = /** @class */ (function (_super) {
    __extends(InstantTradeContractTrade, _super);
    function InstantTradeContractTrade(blockchain, contract, providerIndex, slippageTolerance, instantTrade) {
        var _this = _super.call(this, blockchain, contract, providerIndex) || this;
        _this.slippageTolerance = slippageTolerance;
        _this.instantTrade = instantTrade;
        return _this;
    }
    Object.defineProperty(InstantTradeContractTrade.prototype, "fromToken", {
        get: function () {
            return this.instantTrade.from;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InstantTradeContractTrade.prototype, "toToken", {
        get: function () {
            return this.instantTrade.to;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InstantTradeContractTrade.prototype, "toTokenAmountMin", {
        get: function () {
            return this.toToken.tokenAmount.multipliedBy(1 - this.slippageTolerance);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InstantTradeContractTrade.prototype, "path", {
        get: function () {
            return this.instantTrade.path;
        },
        enumerable: false,
        configurable: true
    });
    InstantTradeContractTrade.prototype.getFirstPath = function () {
        return this.path.map(function (token) { return token.address; });
    };
    InstantTradeContractTrade.prototype.getSecondPath = function () {
        return this.path.map(function (token) { return core_1.Web3Pure.addressToBytes32(token.address); });
    };
    __decorate([
        pure_decorator_1.Pure
    ], InstantTradeContractTrade.prototype, "toTokenAmountMin", null);
    return InstantTradeContractTrade;
}(contract_trade_1.ContractTrade));
exports.InstantTradeContractTrade = InstantTradeContractTrade;
//# sourceMappingURL=instant-trade-contract-trade.js.map