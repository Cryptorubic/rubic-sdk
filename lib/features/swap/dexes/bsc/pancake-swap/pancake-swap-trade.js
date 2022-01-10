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
exports.PancakeSwapTrade = void 0;
var constants_1 = require("./constants");
var uniswap_v2_abstract_trade_1 = require("../../common/uniswap-v2-abstract/uniswap-v2-abstract-trade");
var features_1 = require("../../../..");
var PancakeSwapTrade = /** @class */ (function (_super) {
    __extends(PancakeSwapTrade, _super);
    function PancakeSwapTrade(tradeStruct) {
        var _this = _super.call(this, tradeStruct) || this;
        _this.contractAddress = constants_1.PANCAKE_SWAP_CONTRACT_ADDRESS;
        return _this;
    }
    Object.defineProperty(PancakeSwapTrade, "type", {
        get: function () {
            return features_1.TRADE_TYPE.PANCAKE_SWAP;
        },
        enumerable: false,
        configurable: true
    });
    return PancakeSwapTrade;
}(uniswap_v2_abstract_trade_1.UniswapV2AbstractTrade));
exports.PancakeSwapTrade = PancakeSwapTrade;
//# sourceMappingURL=pancake-swap-trade.js.map