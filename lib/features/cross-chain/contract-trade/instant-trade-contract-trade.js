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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstantTradeContractTrade = void 0;
var contract_trade_1 = require("./contract-trade");
var core_1 = require("../../../core");
var InstantTradeContractTrade = /** @class */ (function (_super) {
    __extends(InstantTradeContractTrade, _super);
    function InstantTradeContractTrade(blockchain, contract, providerIndex, slippageTolerance, instantTrade) {
        var _this = _super.call(this, blockchain, contract, providerIndex) || this;
        _this.slippageTolerance = slippageTolerance;
        _this.instantTrade = instantTrade;
        _this.fromToken = _this.instantTrade.from;
        _this.toToken = _this.instantTrade.to;
        _this.toTokenAmountMin = _this.toToken.tokenAmount.multipliedBy(1 - _this.slippageTolerance);
        _this.path = _this.instantTrade.path;
        return _this;
    }
    InstantTradeContractTrade.prototype.getFirstPath = function () {
        return this.instantTrade.wrappedPath.map(function (token) { return token.address; });
    };
    InstantTradeContractTrade.prototype.getSecondPath = function () {
        return this.instantTrade.wrappedPath.map(function (token) { return core_1.Web3Pure.addressToBytes32(token.address); });
    };
    return InstantTradeContractTrade;
}(contract_trade_1.ContractTrade));
exports.InstantTradeContractTrade = InstantTradeContractTrade;
//# sourceMappingURL=instant-trade-contract-trade.js.map