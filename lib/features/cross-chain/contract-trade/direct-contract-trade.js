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
exports.DirectContractTrade = void 0;
var contract_trade_1 = require("./contract-trade");
var core_1 = require("../../../core");
var DirectContractTrade = /** @class */ (function (_super) {
    __extends(DirectContractTrade, _super);
    function DirectContractTrade(blockchain, contract, token) {
        var _this = _super.call(this, blockchain, contract, 0) || this;
        _this.token = token;
        return _this;
    }
    Object.defineProperty(DirectContractTrade.prototype, "fromToken", {
        get: function () {
            return this.token;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DirectContractTrade.prototype, "toToken", {
        get: function () {
            return this.token;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DirectContractTrade.prototype, "toTokenAmountMin", {
        get: function () {
            return this.token.tokenAmount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DirectContractTrade.prototype, "path", {
        get: function () {
            return [this.token];
        },
        enumerable: false,
        configurable: true
    });
    DirectContractTrade.prototype.getFirstPath = function () {
        return [this.token.address];
    };
    DirectContractTrade.prototype.getSecondPath = function () {
        return [core_1.Web3Pure.addressToBytes32(this.token.address)];
    };
    return DirectContractTrade;
}(contract_trade_1.ContractTrade));
exports.DirectContractTrade = DirectContractTrade;
//# sourceMappingURL=direct-contract-trade.js.map