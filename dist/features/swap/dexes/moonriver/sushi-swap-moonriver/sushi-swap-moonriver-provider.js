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
exports.SushiSwapMoonriverProvider = void 0;
var BLOCKCHAIN_NAME_1 = require("../../../../../core/blockchain/models/BLOCKCHAIN_NAME");
var uniswap_v2_abstract_provider_1 = require("../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider");
var constants_1 = require("./constants");
var sushi_swap_moonriver_trade_1 = require("./sushi-swap-moonriver-trade");
var SushiSwapMoonriverProvider = /** @class */ (function (_super) {
    __extends(SushiSwapMoonriverProvider, _super);
    function SushiSwapMoonriverProvider() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.blockchain = BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.MOONRIVER;
        _this.InstantTradeClass = sushi_swap_moonriver_trade_1.SushiSwapMoonriverTrade;
        _this.providerSettings = constants_1.SUSHI_SWAP_MOONRIVER_PROVIDER_CONFIGURATION;
        return _this;
    }
    return SushiSwapMoonriverProvider;
}(uniswap_v2_abstract_provider_1.UniswapV2AbstractProvider));
exports.SushiSwapMoonriverProvider = SushiSwapMoonriverProvider;
//# sourceMappingURL=sushi-swap-moonriver-provider.js.map