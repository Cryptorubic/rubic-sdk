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
exports.SushiSwapAvalancheTrade = void 0;
var constants_1 = require("@features/swap/dexes/avalanche/sushi-swap-avalanche/constants");
var uniswap_v2_abstract_trade_1 = require("@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade");
var SushiSwapAvalancheTrade = /** @class */ (function (_super) {
    __extends(SushiSwapAvalancheTrade, _super);
    function SushiSwapAvalancheTrade(tradeStruct) {
        var _this = _super.call(this, tradeStruct) || this;
        _this.contractAddress = constants_1.SUSHI_SWAP_AVALANCHE_CONTRACT_ADDRESS;
        return _this;
    }
    return SushiSwapAvalancheTrade;
}(uniswap_v2_abstract_trade_1.UniswapV2AbstractTrade));
exports.SushiSwapAvalancheTrade = SushiSwapAvalancheTrade;
//# sourceMappingURL=sushi-swap-avalanche-trade.js.map