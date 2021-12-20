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
exports.QuickSwapProvider = void 0;
var BLOCKCHAIN_NAME_1 = require("../../../../../core/blockchain/models/BLOCKCHAIN_NAME");
var uniswap_v2_abstract_provider_1 = require("../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider");
var constants_1 = require("./constants");
var quick_swap_trade_1 = require("./quick-swap-trade");
var QuickSwapProvider = /** @class */ (function (_super) {
    __extends(QuickSwapProvider, _super);
    function QuickSwapProvider() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.blockchain = BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.POLYGON;
        _this.InstantTradeClass = quick_swap_trade_1.QuickSwapTrade;
        _this.providerSettings = constants_1.QUICK_SWAP_PROVIDER_CONFIGURATION;
        return _this;
    }
    return QuickSwapProvider;
}(uniswap_v2_abstract_provider_1.UniswapV2AbstractProvider));
exports.QuickSwapProvider = QuickSwapProvider;
//# sourceMappingURL=quick-swap-provider.js.map