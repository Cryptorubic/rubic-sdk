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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniSwapV3Provider = void 0;
/**
 * Shows whether Eth is used as from or to token.
 */
var options_1 = require("../../../../../common/utils/options");
var BLOCKCHAIN_NAME_1 = require("../../../../../core/blockchain/models/BLOCKCHAIN_NAME");
var liquidity_pools_controller_1 = require("./utils/liquidity-pool-controller/liquidity-pools-controller");
var price_token_amount_1 = require("../../../../../core/blockchain/tokens/price-token-amount");
var token_native_address_proxy_1 = require("../../common/utils/token-native-address-proxy");
var insufficient_liquidity_error_1 = require("../../../../../common/errors/swap/insufficient-liquidity.error");
var web3_pure_1 = require("../../../../../core/blockchain/web3-pure/web3-pure");
var uni_swap_v3_trade_1 = require("./uni-swap-v3-trade");
var instant_trade_provider_1 = require("../../../instant-trade-provider");
var features_1 = require("../../../..");
var RUBIC_OPTIMIZATION_DISABLED = true;
var UniSwapV3Provider = /** @class */ (function (_super) {
    __extends(UniSwapV3Provider, _super);
    function UniSwapV3Provider() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.blockchain = BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.ETHEREUM;
        _this.defaultOptions = {
            gasCalculation: 'calculate',
            disableMultihops: false,
            deadlineMinutes: 20,
            slippageTolerance: 0.02
        };
        _this.gasMargin = 1.2;
        _this.maxTransitPools = 1;
        _this.wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
        _this.liquidityPoolsController = new liquidity_pools_controller_1.LiquidityPoolsController(_this.web3Public);
        return _this;
    }
    Object.defineProperty(UniSwapV3Provider.prototype, "type", {
        get: function () {
            return features_1.TRADE_TYPE.UNISWAP_V3;
        },
        enumerable: false,
        configurable: true
    });
    UniSwapV3Provider.prototype.calculate = function (from, toToken, options) {
        return __awaiter(this, void 0, void 0, function () {
            var fullOptions, fromClone, toClone, gasPriceInfo, _a, route, estimatedGas, tradeStruct, gasFeeInfo;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fullOptions = (0, options_1.combineOptions)(options, this.defaultOptions);
                        fromClone = (0, token_native_address_proxy_1.createTokenNativeAddressProxy)(from, this.wethAddress);
                        toClone = (0, token_native_address_proxy_1.createTokenNativeAddressProxy)(toToken, this.wethAddress);
                        if (!(fullOptions.gasCalculation !== 'disabled')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getGasPriceInfo()];
                    case 1:
                        gasPriceInfo = _b.sent();
                        _b.label = 2;
                    case 2: return [4 /*yield*/, this.getRoute(fromClone, toClone, fullOptions, gasPriceInfo === null || gasPriceInfo === void 0 ? void 0 : gasPriceInfo.gasPriceInUsd)];
                    case 3:
                        _a = _b.sent(), route = _a.route, estimatedGas = _a.estimatedGas;
                        tradeStruct = {
                            from: from,
                            to: new price_token_amount_1.PriceTokenAmount(__assign(__assign({}, toToken.asStruct), { weiAmount: route.outputAbsoluteAmount })),
                            slippageTolerance: fullOptions.slippageTolerance,
                            deadlineMinutes: fullOptions.deadlineMinutes,
                            route: route
                        };
                        if (fullOptions.gasCalculation === 'disabled') {
                            return [2 /*return*/, new uni_swap_v3_trade_1.UniSwapV3Trade(tradeStruct)];
                        }
                        gasFeeInfo = this.getGasFeeInfo(estimatedGas, gasPriceInfo);
                        return [2 /*return*/, new uni_swap_v3_trade_1.UniSwapV3Trade(__assign(__assign({}, tradeStruct), { gasFeeInfo: gasFeeInfo }))];
                }
            });
        });
    };
    /**
     * Returns most profitable route and estimated gas, if related option in {@param options} is set.
     * @param from From token and amount.
     * @param toToken To token.
     * @param options Swap options.
     * @param gasPriceInUsd Gas price in usd.
     */
    UniSwapV3Provider.prototype.getRoute = function (from, toToken, options, gasPriceInUsd) {
        return __awaiter(this, void 0, void 0, function () {
            var routes, estimatedGasLimits_1, calculatedProfits, route, estimatedGas;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.liquidityPoolsController.getAllRoutes(from, toToken, options.disableMultihops ? 0 : this.maxTransitPools)];
                    case 1:
                        routes = (_a.sent()).sort(function (a, b) { return b.outputAbsoluteAmount.comparedTo(a.outputAbsoluteAmount); });
                        if (routes.length === 0) {
                            throw new insufficient_liquidity_error_1.InsufficientLiquidityError();
                        }
                        if (options.gasCalculation === 'disabled') {
                            return [2 /*return*/, {
                                    route: routes[0]
                                }];
                        }
                        if (!(!RUBIC_OPTIMIZATION_DISABLED &&
                            options.gasCalculation === 'rubicOptimisation' &&
                            toToken.price)) return [3 /*break*/, 3];
                        return [4 /*yield*/, uni_swap_v3_trade_1.UniSwapV3Trade.estimateGasLimitForRoutes(from, toToken, options, routes)];
                    case 2:
                        estimatedGasLimits_1 = _a.sent();
                        calculatedProfits = routes.map(function (route, index) {
                            var estimatedGas = estimatedGasLimits_1[index];
                            var gasFeeInUsd = gasPriceInUsd.multipliedBy(estimatedGas);
                            var profit = web3_pure_1.Web3Pure.fromWei(route.outputAbsoluteAmount, toToken.decimals)
                                .multipliedBy(toToken.price)
                                .minus(gasFeeInUsd);
                            return {
                                route: route,
                                estimatedGas: estimatedGas,
                                profit: profit
                            };
                        });
                        return [2 /*return*/, calculatedProfits.sort(function (a, b) { return b.profit.comparedTo(a.profit); })[0]];
                    case 3:
                        route = routes[0];
                        return [4 /*yield*/, uni_swap_v3_trade_1.UniSwapV3Trade.estimateGasLimitForRoute(from, toToken, options, route)];
                    case 4:
                        estimatedGas = _a.sent();
                        return [2 /*return*/, {
                                route: route,
                                estimatedGas: estimatedGas
                            }];
                }
            });
        });
    };
    return UniSwapV3Provider;
}(instant_trade_provider_1.InstantTradeProvider));
exports.UniSwapV3Provider = UniSwapV3Provider;
//# sourceMappingURL=uni-swap-v3-provider.js.map