"use strict";
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstantTradesManager = void 0;
var rubic_sdk_error_1 = require("../../common/errors/rubic-sdk.error");
var object_1 = require("../../common/utils/object");
var options_1 = require("../../common/utils/options");
var token_1 = require("../../core/blockchain/tokens/token");
var joe_provider_1 = require("./dexes/avalanche/joe/joe-provider");
var pangolin_provider_1 = require("./dexes/avalanche/pangolin/pangolin-provider");
var sushi_swap_avalanche_provider_1 = require("./dexes/avalanche/sushi-swap-avalanche/sushi-swap-avalanche-provider");
var oneinch_bsc_provider_1 = require("./dexes/bsc/oneinch-bsc/oneinch-bsc-provider");
var pancake_swap_provider_1 = require("./dexes/bsc/pancake-swap/pancake-swap-provider");
var sushi_swap_bsc_provider_1 = require("./dexes/bsc/sushi-swap-bsc/sushi-swap-bsc-provider");
var oneinch_ethereum_provider_1 = require("./dexes/ethereum/oneinch-ethereum/oneinch-ethereum-provider");
var sushi_swap_ethereum_provider_1 = require("./dexes/ethereum/sushi-swap-ethereum/sushi-swap-ethereum-provider");
var uni_swap_v2_provider_1 = require("./dexes/ethereum/uni-swap-v2/uni-swap-v2-provider");
var uni_swap_v3_provider_1 = require("./dexes/ethereum/uni-swap-v3/uni-swap-v3-provider");
var spirit_swap_provider_1 = require("./dexes/fantom/spirit-swap/spirit-swap-provider");
var spooky_swap_provider_1 = require("./dexes/fantom/spooky-swap/spooky-swap-provider");
var sushi_swap_fantom_provider_1 = require("./dexes/fantom/sushi-swap-fantom/sushi-swap-fantom-provider");
var sushi_swap_harmony_provider_1 = require("./dexes/harmony/sushi-swap-harmony/sushi-swap-harmony-provider");
var solarbeam_provider_1 = require("./dexes/moonriver/solarbeam/solarbeam-provider");
var sushi_swap_moonriver_provider_1 = require("./dexes/moonriver/sushi-swap-moonriver/sushi-swap-moonriver-provider");
var oneinch_polygon_provider_1 = require("./dexes/polygon/oneinch-polygon/oneinch-polygon-provider");
var quick_swap_provider_1 = require("./dexes/polygon/quick-swap/quick-swap-provider");
var sushi_swap_polygon_provider_1 = require("./dexes/polygon/sushi-swap-polygon/sushi-swap-polygon-provider");
var p_timeout_1 = __importDefault(require("p-timeout"));
var zrx_ethereum_provider_1 = require("./dexes/ethereum/zrx-ethereum/zrx-ethereum-provider");
var tokens_1 = require("../../common/utils/tokens");
var InstantTradesManager = /** @class */ (function () {
    function InstantTradesManager() {
        this.uniswapV2TradeProviders = [
            uni_swap_v2_provider_1.UniSwapV2Provider,
            sushi_swap_ethereum_provider_1.SushiSwapEthereumProvider,
            pancake_swap_provider_1.PancakeSwapProvider,
            sushi_swap_bsc_provider_1.SushiSwapBscProvider,
            quick_swap_provider_1.QuickSwapProvider,
            sushi_swap_polygon_provider_1.SushiSwapPolygonProvider,
            joe_provider_1.JoeProvider,
            pangolin_provider_1.PangolinProvider,
            sushi_swap_avalanche_provider_1.SushiSwapAvalancheProvider,
            spirit_swap_provider_1.SpiritSwapProvider,
            spooky_swap_provider_1.SpookySwapProvider,
            sushi_swap_fantom_provider_1.SushiSwapFantomProvider,
            sushi_swap_harmony_provider_1.SushiSwapHarmonyProvider,
            solarbeam_provider_1.SolarbeamProvider,
            sushi_swap_moonriver_provider_1.SushiSwapMoonriverProvider
        ];
        this.uniswapV3TradeProviders = [uni_swap_v3_provider_1.UniSwapV3Provider];
        this.oneInchTradeProviders = [
            oneinch_ethereum_provider_1.OneinchEthereumProvider,
            oneinch_bsc_provider_1.OneinchBscProvider,
            oneinch_polygon_provider_1.OneinchPolygonProvider
        ];
        this.zrxTradeProviders = [zrx_ethereum_provider_1.ZrxEthereumProvider];
        this.tradeProviders = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], this.uniswapV2TradeProviders, true), this.uniswapV3TradeProviders, true), this.oneInchTradeProviders, true), this.zrxTradeProviders, true).reduce(function (acc, ProviderClass) {
            var provider = new ProviderClass();
            acc[provider.type] = provider;
            return acc;
        }, {});
        this.blockchainTradeProviders = Object.entries(this.tradeProviders).reduce(function (acc, _a) {
            var _b, _c;
            var type = _a[0], provider = _a[1];
            return (__assign(__assign({}, acc), (_b = {}, _b[provider.blockchain] = __assign(__assign({}, acc[provider.blockchain]), (_c = {}, _c[type] = provider, _c)), _b)));
        }, {});
    }
    InstantTradesManager.prototype.calculateTrade = function (fromToken, fromAmount, toToken, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, from, to;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (toToken instanceof token_1.Token && fromToken.blockchain !== toToken.blockchain) {
                            throw new rubic_sdk_error_1.RubicSdkError('Blockchains of from and to tokens must be same.');
                        }
                        return [4 /*yield*/, (0, tokens_1.getPriceTokensFromInputTokens)(fromToken, fromAmount.toString(), toToken)];
                    case 1:
                        _a = _b.sent(), from = _a.from, to = _a.to;
                        return [2 /*return*/, this.calculateTradeFromTokens(from, to, this.getFullOptions(options))];
                }
            });
        });
    };
    InstantTradesManager.prototype.getFullOptions = function (options) {
        return (0, options_1.combineOptions)(options, {
            timeout: InstantTradesManager.defaultCalculationTimeout,
            disabledProviders: []
        });
    };
    InstantTradesManager.prototype.calculateTradeFromTokens = function (from, to, options) {
        return __awaiter(this, void 0, void 0, function () {
            var timeout, disabledProviders, providersOptions, providers, calculationPromises, results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        timeout = options.timeout, disabledProviders = options.disabledProviders, providersOptions = __rest(options, ["timeout", "disabledProviders"]);
                        providers = Object.entries(this.blockchainTradeProviders[from.blockchain]).filter(function (_a) {
                            var type = _a[0];
                            return !disabledProviders.includes(type);
                        });
                        if (!providers.length) {
                            throw new rubic_sdk_error_1.RubicSdkError("There are no providers for ".concat(from.blockchain, " blockchain"));
                        }
                        calculationPromises = providers.map(function (_a) {
                            var type = _a[0], provider = _a[1];
                            return __awaiter(_this, void 0, void 0, function () {
                                var e_1;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _b.trys.push([0, 2, , 3]);
                                            return [4 /*yield*/, (0, p_timeout_1.default)(provider.calculate(from, to, providersOptions), timeout)];
                                        case 1: return [2 /*return*/, _b.sent()];
                                        case 2:
                                            e_1 = _b.sent();
                                            console.debug("[RUBIC_SDK] Trade calculation error occurred for ".concat(type, " trade provider."), e_1);
                                            return [2 /*return*/, null];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            });
                        });
                        return [4 /*yield*/, Promise.all(calculationPromises)];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results.filter(object_1.notNull)];
                }
            });
        });
    };
    InstantTradesManager.defaultCalculationTimeout = 3000;
    return InstantTradesManager;
}());
exports.InstantTradesManager = InstantTradesManager;
//# sourceMappingURL=instant-trades-manager.js.map