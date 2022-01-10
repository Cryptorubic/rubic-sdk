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
exports.UniswapV2AbstractProvider = void 0;
var gas_price_api_1 = require("../../../../../common/http/gas-price-api");
var options_1 = require("../../../../../common/utils/options");
var price_token_amount_1 = require("../../../../../core/blockchain/tokens/price-token-amount");
var path_factory_1 = require("./path-factory");
var instant_trade_provider_1 = require("../../../instant-trade-provider");
var token_native_address_proxy_1 = require("../utils/token-native-address-proxy");
var UniswapV2AbstractProvider = /** @class */ (function (_super) {
    __extends(UniswapV2AbstractProvider, _super);
    function UniswapV2AbstractProvider() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.defaultOptions = {
            gasCalculation: 'calculate',
            disableMultihops: false,
            deadlineMinutes: 20,
            slippageTolerance: 0.02
        };
        _this.gasMargin = 1.2;
        return _this;
    }
    Object.defineProperty(UniswapV2AbstractProvider.prototype, "type", {
        get: function () {
            return this.InstantTradeClass.type;
        },
        enumerable: false,
        configurable: true
    });
    UniswapV2AbstractProvider.prototype.calculate = function (from, to, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.calculateDifficultTrade(from, to, from.weiAmount, 'input', options)];
            });
        });
    };
    UniswapV2AbstractProvider.prototype.calculateExactOutput = function (from, to, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.calculateDifficultTrade(from, to, to.weiAmount, 'output', options)];
            });
        });
    };
    UniswapV2AbstractProvider.prototype.calculateDifficultTrade = function (from, to, weiAmount, exact, options) {
        return __awaiter(this, void 0, void 0, function () {
            var fullOptions, fromProxy, toProxy, gasPriceInfo, _a, route, estimatedGas, fromAmount, toAmount, instantTrade;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fullOptions = (0, options_1.combineOptions)(options, this.defaultOptions);
                        fromProxy = (0, token_native_address_proxy_1.createTokenNativeAddressProxy)(from, this.providerSettings.wethAddress);
                        toProxy = (0, token_native_address_proxy_1.createTokenNativeAddressProxy)(to, this.providerSettings.wethAddress);
                        if (!(fullOptions.gasCalculation !== 'disabled' &&
                            gas_price_api_1.GasPriceApi.isSupportedBlockchain(from.blockchain))) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getGasPriceInfo()];
                    case 1:
                        gasPriceInfo = _b.sent();
                        _b.label = 2;
                    case 2: return [4 /*yield*/, this.getAmountAndPath(fromProxy, toProxy, weiAmount, exact, fullOptions, gasPriceInfo === null || gasPriceInfo === void 0 ? void 0 : gasPriceInfo.gasPriceInUsd)];
                    case 3:
                        _a = _b.sent(), route = _a.route, estimatedGas = _a.estimatedGas;
                        fromAmount = exact === 'input' ? weiAmount : route.outputAbsoluteAmount;
                        toAmount = exact === 'output' ? weiAmount : route.outputAbsoluteAmount;
                        instantTrade = new this.InstantTradeClass({
                            from: new price_token_amount_1.PriceTokenAmount(__assign(__assign({}, from.asStruct), { weiAmount: fromAmount })),
                            to: new price_token_amount_1.PriceTokenAmount(__assign(__assign({}, to.asStruct), { weiAmount: toAmount })),
                            exact: exact,
                            wrappedPath: route.path,
                            deadlineMinutes: fullOptions.deadlineMinutes,
                            slippageTolerance: fullOptions.slippageTolerance
                        });
                        if (fullOptions.gasCalculation === 'disabled') {
                            return [2 /*return*/, instantTrade];
                        }
                        instantTrade.gasFeeInfo = this.getGasFeeInfo(estimatedGas, gasPriceInfo);
                        return [2 /*return*/, instantTrade];
                }
            });
        });
    };
    UniswapV2AbstractProvider.prototype.getAmountAndPath = function (from, to, weiAmount, exact, options, gasPriceInUsd) {
        return __awaiter(this, void 0, void 0, function () {
            var pathFactory;
            return __generator(this, function (_a) {
                pathFactory = new path_factory_1.PathFactory(this, { from: from, to: to, weiAmount: weiAmount, exact: exact, options: options });
                return [2 /*return*/, pathFactory.getAmountAndPath(gasPriceInUsd)];
            });
        });
    };
    return UniswapV2AbstractProvider;
}(instant_trade_provider_1.InstantTradeProvider));
exports.UniswapV2AbstractProvider = UniswapV2AbstractProvider;
//# sourceMappingURL=uniswap-v2-abstract-provider.js.map