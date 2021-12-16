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
exports.ItContractTrade = void 0;
var ContractTrade_1 = require("./ContractTrade");
var pure_decorator_1 = require("../../../../common/decorators/pure.decorator");
var ItContractTrade = /** @class */ (function (_super) {
    __extends(ItContractTrade, _super);
    function ItContractTrade(blockchain, contract, slippageTolerance, instantTrade) {
        var _this = _super.call(this, blockchain, contract) || this;
        _this.blockchain = blockchain;
        _this.contract = contract;
        _this.slippageTolerance = slippageTolerance;
        _this.instantTrade = instantTrade;
        return _this;
    }
    Object.defineProperty(ItContractTrade.prototype, "fromToken", {
        get: function () {
            return this.instantTrade.from;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ItContractTrade.prototype, "toToken", {
        get: function () {
            return this.instantTrade.to;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ItContractTrade.prototype, "toAmount", {
        get: function () {
            return this.instantTrade.to.tokenAmount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ItContractTrade.prototype, "toAmountWei", {
        get: function () {
            return this.instantTrade.to.weiAmount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ItContractTrade.prototype, "toAmountMin", {
        get: function () {
            return this.toAmount.multipliedBy(1 - this.slippageTolerance);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ItContractTrade.prototype, "path", {
        get: function () {
            return this.instantTrade.path;
        },
        enumerable: false,
        configurable: true
    });
    __decorate([
        pure_decorator_1.Pure
    ], ItContractTrade.prototype, "toAmountMin", null);
    return ItContractTrade;
}(ContractTrade_1.ContractTrade));
exports.ItContractTrade = ItContractTrade;
//# sourceMappingURL=ItContractTrade.js.map