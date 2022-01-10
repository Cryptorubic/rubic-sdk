"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isZrxLikeTradeLikeTrade = exports.isOneInchLikeTrade = exports.isUniswapV3LikeTrade = exports.isUniswapV2LikeTrade = void 0;
var uniswap_v2_abstract_trade_1 = require("./dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade");
var oneinch_trade_1 = require("./dexes/common/oneinch-common/oneinch-trade");
var zrx_trade_1 = require("./dexes/common/zrx-common/zrx-trade");
var uni_swap_v3_trade_1 = require("./dexes/ethereum/uni-swap-v3/uni-swap-v3-trade");
function isUniswapV2LikeTrade(trade) {
    return trade instanceof uniswap_v2_abstract_trade_1.UniswapV2AbstractTrade;
}
exports.isUniswapV2LikeTrade = isUniswapV2LikeTrade;
function isUniswapV3LikeTrade(trade) {
    return trade instanceof uni_swap_v3_trade_1.UniSwapV3Trade;
}
exports.isUniswapV3LikeTrade = isUniswapV3LikeTrade;
function isOneInchLikeTrade(trade) {
    return trade instanceof oneinch_trade_1.OneinchTrade;
}
exports.isOneInchLikeTrade = isOneInchLikeTrade;
function isZrxLikeTradeLikeTrade(trade) {
    return trade instanceof zrx_trade_1.ZrxTrade;
}
exports.isZrxLikeTradeLikeTrade = isZrxLikeTradeLikeTrade;
//# sourceMappingURL=type-guards.js.map