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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZrxAbstractProvider = void 0;
var gas_price_api_1 = require("../../../../../common/http/gas-price-api");
var instant_trade_provider_1 = require("../../../instant-trade-provider");
var price_token_amount_1 = require("../../../../../core/blockchain/tokens/price-token-amount");
var token_native_address_proxy_1 = require("../utils/token-native-address-proxy");
var constants_1 = require("./constants");
var injector_1 = require("../../../../../core/sdk/injector");
var utils_1 = require("./utils");
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var zrx_trade_1 = require("./zrx-trade");
var common_1 = require("../../../../../common");
var ZrxAbstractProvider = /** @class */ (function (_super) {
    __extends(ZrxAbstractProvider, _super);
    function ZrxAbstractProvider() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.gasMargin = 1.4;
        _this.defaultOptions = {
            gasCalculation: 'calculate',
            slippageTolerance: 0.02,
            affiliateAddress: null
        };
        return _this;
    }
    Object.defineProperty(ZrxAbstractProvider.prototype, "apiBaseUrl", {
        get: function () {
            return (0, utils_1.getZrxApiBaseUrl)(this.blockchain);
        },
        enumerable: false,
        configurable: true
    });
    ZrxAbstractProvider.prototype.calculate = function (from, to, options) {
        return __awaiter(this, void 0, void 0, function () {
            var fullOptions, fromClone, toClone, quoteParams, apiTradeData, tradeStruct, gasPriceInfo, gasFeeInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fullOptions = __assign(__assign({}, this.defaultOptions), { options: options });
                        fromClone = (0, token_native_address_proxy_1.createTokenNativeAddressProxy)(from, constants_1.zrxApiParams.nativeTokenAddress);
                        toClone = (0, token_native_address_proxy_1.createTokenNativeAddressProxy)(to, constants_1.zrxApiParams.nativeTokenAddress);
                        quoteParams = {
                            params: {
                                sellToken: fromClone.address,
                                buyToken: toClone.address,
                                sellAmount: fromClone.stringWeiAmount,
                                slippagePercentage: fullOptions.slippageTolerance.toString(),
                                affiliateAddress: fullOptions.affiliateAddress || undefined
                            }
                        };
                        return [4 /*yield*/, this.getTradeData(quoteParams)];
                    case 1:
                        apiTradeData = _a.sent();
                        tradeStruct = {
                            from: from,
                            to: new price_token_amount_1.PriceTokenAmount(__assign(__assign({}, to.asStruct), { weiAmount: new bignumber_js_1.default(apiTradeData.buyAmount) })),
                            slippageTolerance: fullOptions.slippageTolerance,
                            apiTradeData: apiTradeData
                        };
                        if (fullOptions.gasCalculation === 'disabled' ||
                            !gas_price_api_1.GasPriceApi.isSupportedBlockchain(from.blockchain)) {
                            return [2 /*return*/, new zrx_trade_1.ZrxTrade(tradeStruct)];
                        }
                        return [4 /*yield*/, this.getGasPriceInfo()];
                    case 2:
                        gasPriceInfo = _a.sent();
                        return [4 /*yield*/, this.getGasFeeInfo(apiTradeData.gas, gasPriceInfo)];
                    case 3:
                        gasFeeInfo = _a.sent();
                        return [2 /*return*/, new zrx_trade_1.ZrxTrade(__assign(__assign({}, tradeStruct), { gasFeeInfo: gasFeeInfo }))];
                }
            });
        });
    };
    /**
     * Fetches zrx data from api.
     */
    ZrxAbstractProvider.prototype.getTradeData = function (params) {
        return injector_1.Injector.httpClient.get("".concat(this.apiBaseUrl, "swap/v1/quote"), params);
    };
    __decorate([
        common_1.Cache
    ], ZrxAbstractProvider.prototype, "apiBaseUrl", null);
    return ZrxAbstractProvider;
}(instant_trade_provider_1.InstantTradeProvider));
exports.ZrxAbstractProvider = ZrxAbstractProvider;
//# sourceMappingURL=zrx-abstract-provider.js.map