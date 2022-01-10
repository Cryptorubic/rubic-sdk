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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.OneinchAbstractProvider = void 0;
var gas_price_api_1 = require("../../../../../common/http/gas-price-api");
var options_1 = require("../../../../../common/utils/options");
var price_token_amount_1 = require("../../../../../core/blockchain/tokens/price-token-amount");
var token_1 = require("../../../../../core/blockchain/tokens/token");
var injector_1 = require("../../../../../core/sdk/injector");
var constants_1 = require("./constants");
var rubic_sdk_error_1 = require("../../../../../common/errors/rubic-sdk.error");
var utils_1 = require("./utils");
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var oneinch_trade_1 = require("./oneinch-trade");
var instant_trade_provider_1 = require("../../../instant-trade-provider");
var token_native_address_proxy_1 = require("../utils/token-native-address-proxy");
var common_1 = require("../../../../../common");
var OneinchAbstractProvider = /** @class */ (function (_super) {
    __extends(OneinchAbstractProvider, _super);
    function OneinchAbstractProvider() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.httpClient = injector_1.Injector.httpClient;
        _this.defaultOptions = {
            gasCalculation: 'calculate',
            disableMultihops: false,
            slippageTolerance: 0.02
        };
        _this.gasMargin = 1;
        _this.supportedTokens = [];
        return _this;
    }
    Object.defineProperty(OneinchAbstractProvider.prototype, "walletAddress", {
        get: function () {
            return injector_1.Injector.web3Private.address;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(OneinchAbstractProvider.prototype, "apiBaseUrl", {
        get: function () {
            return (0, utils_1.getOneinchApiBaseUrl)(this.blockchain);
        },
        enumerable: false,
        configurable: true
    });
    OneinchAbstractProvider.prototype.getSupportedTokensByBlockchain = function () {
        return __awaiter(this, void 0, void 0, function () {
            var oneinchTokensResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.supportedTokens.length) {
                            return [2 /*return*/, this.supportedTokens];
                        }
                        return [4 /*yield*/, this.httpClient.get("".concat(this.apiBaseUrl, "/tokens"))];
                    case 1:
                        oneinchTokensResponse = _a.sent();
                        this.supportedTokens = Object.keys(oneinchTokensResponse.tokens).map(function (tokenAddress) {
                            return tokenAddress.toLowerCase();
                        });
                        return [2 /*return*/, this.supportedTokens];
                }
            });
        });
    };
    OneinchAbstractProvider.prototype.loadContractAddress = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.httpClient.get("".concat(this.apiBaseUrl, "/approve/spender"))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.address];
                }
            });
        });
    };
    OneinchAbstractProvider.prototype.calculate = function (from, toToken, options) {
        return __awaiter(this, void 0, void 0, function () {
            var fullOptions, fromClone, toTokenClone, supportedTokensAddresses, _a, contractAddress, _b, toTokenAmountInWei, estimatedGas, path, oneinchTradeStruct, gasPriceInfo, gasFeeInfo;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        fullOptions = (0, options_1.combineOptions)(options, this.defaultOptions);
                        fromClone = (0, token_native_address_proxy_1.createTokenNativeAddressProxy)(from, constants_1.oneinchApiParams.nativeAddress);
                        toTokenClone = (0, token_native_address_proxy_1.createTokenNativeAddressProxy)(toToken, constants_1.oneinchApiParams.nativeAddress);
                        return [4 /*yield*/, this.getSupportedTokensByBlockchain()];
                    case 1:
                        supportedTokensAddresses = _c.sent();
                        if (!supportedTokensAddresses.includes(fromClone.address.toLowerCase()) ||
                            !supportedTokensAddresses.includes(toTokenClone.address.toLowerCase())) {
                            throw new rubic_sdk_error_1.RubicSdkError("Oneinch doesn't support this tokens");
                        }
                        return [4 /*yield*/, Promise.all([
                                this.loadContractAddress(),
                                this.getTradeInfo(fromClone, toTokenClone, fullOptions)
                            ])];
                    case 2:
                        _a = _c.sent(), contractAddress = _a[0], _b = _a[1], toTokenAmountInWei = _b.toTokenAmountInWei, estimatedGas = _b.estimatedGas, path = _b.path;
                        path[0] = from;
                        path[path.length - 1] = toToken;
                        oneinchTradeStruct = {
                            contractAddress: contractAddress,
                            from: from,
                            to: new price_token_amount_1.PriceTokenAmount(__assign(__assign({}, toToken.asStruct), { weiAmount: toTokenAmountInWei })),
                            slippageTolerance: fullOptions.slippageTolerance,
                            disableMultihops: fullOptions.disableMultihops,
                            path: path
                        };
                        if (fullOptions.gasCalculation === 'disabled' ||
                            !gas_price_api_1.GasPriceApi.isSupportedBlockchain(from.blockchain)) {
                            return [2 /*return*/, new oneinch_trade_1.OneinchTrade(oneinchTradeStruct)];
                        }
                        return [4 /*yield*/, this.getGasPriceInfo()];
                    case 3:
                        gasPriceInfo = _c.sent();
                        gasFeeInfo = this.getGasFeeInfo(estimatedGas, gasPriceInfo);
                        return [2 /*return*/, new oneinch_trade_1.OneinchTrade(__assign(__assign({}, oneinchTradeStruct), { gasFeeInfo: gasFeeInfo }))];
                }
            });
        });
    };
    OneinchAbstractProvider.prototype.getTradeInfo = function (from, toToken, options) {
        return __awaiter(this, void 0, void 0, function () {
            var quoteTradeParams, oneInchTrade, estimatedGas, toTokenAmount, swapTradeParams, _err_1, path;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        quoteTradeParams = {
                            params: {
                                fromTokenAddress: from.address,
                                toTokenAddress: toToken.address,
                                amount: from.stringWeiAmount,
                                mainRouteParts: options.disableMultihops ? '1' : undefined
                            }
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 6]);
                        return [4 /*yield*/, oneinch_trade_1.OneinchTrade.checkIfNeedApproveAndThrowError(from)];
                    case 2:
                        _a.sent();
                        swapTradeParams = {
                            params: __assign(__assign({}, quoteTradeParams.params), { slippage: (options.slippageTolerance * 100).toString(), fromAddress: this.walletAddress })
                        };
                        return [4 /*yield*/, this.httpClient.get("".concat(this.apiBaseUrl, "/swap"), swapTradeParams)];
                    case 3:
                        oneInchTrade = _a.sent();
                        estimatedGas = new bignumber_js_1.default(oneInchTrade.tx.gas);
                        toTokenAmount = oneInchTrade.toTokenAmount;
                        return [3 /*break*/, 6];
                    case 4:
                        _err_1 = _a.sent();
                        return [4 /*yield*/, this.httpClient.get("".concat(this.apiBaseUrl, "/quote"), quoteTradeParams)];
                    case 5:
                        oneInchTrade = _a.sent();
                        if (oneInchTrade.hasOwnProperty('errors') || !oneInchTrade.toTokenAmount) {
                            throw new rubic_sdk_error_1.RubicSdkError('1inch quote error');
                        }
                        estimatedGas = new bignumber_js_1.default(oneInchTrade.estimatedGas);
                        toTokenAmount = oneInchTrade.toTokenAmount;
                        return [3 /*break*/, 6];
                    case 6: return [4 /*yield*/, this.extractPath(from, toToken, oneInchTrade)];
                    case 7:
                        path = _a.sent();
                        return [2 /*return*/, { toTokenAmountInWei: new bignumber_js_1.default(toTokenAmount), estimatedGas: estimatedGas, path: path }];
                }
            });
        });
    };
    /**
     * Extracts tokens path from oneInch api response.
     * @return Promise<Token[]> Tokens array, used in the route.
     */
    OneinchAbstractProvider.prototype.extractPath = function (fromToken, toToken, oneInchTrade) {
        return __awaiter(this, void 0, void 0, function () {
            var addressesPath, tokensPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        addressesPath = oneInchTrade.protocols[0].map(function (protocol) { return protocol[0].toTokenAddress; });
                        addressesPath.pop();
                        return [4 /*yield*/, token_1.Token.createTokens(addressesPath, this.blockchain)];
                    case 1:
                        tokensPath = _a.sent();
                        return [2 /*return*/, __spreadArray(__spreadArray([fromToken], tokensPath, true), [toToken], false)];
                }
            });
        });
    };
    __decorate([
        common_1.Cache
    ], OneinchAbstractProvider.prototype, "apiBaseUrl", null);
    return OneinchAbstractProvider;
}(instant_trade_provider_1.InstantTradeProvider));
exports.OneinchAbstractProvider = OneinchAbstractProvider;
//# sourceMappingURL=oneinch-abstract-provider.js.map