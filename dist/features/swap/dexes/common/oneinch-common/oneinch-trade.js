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
exports.OneinchTrade = void 0;
var constants_1 = require("./constants");
var utils_1 = require("./utils");
var token_native_address_proxy_1 = require("../utils/token-native-address-proxy");
var instant_trade_1 = require("../../../instant-trade");
var injector_1 = require("../../../../../core/sdk/injector");
var pure_decorator_1 = require("../../../../../common/decorators/pure.decorator");
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var rubic_sdk_error_1 = require("../../../../../common/errors/rubic-sdk-error");
var InsufficientFundsOneinchError_1 = __importDefault(require("../../../../../common/errors/swap/InsufficientFundsOneinchError"));
var blockchains_1 = require("../../../../../core/blockchain/constants/blockchains");
var low_slippage_error_1 = require("../../../../../common/errors/swap/low-slippage.error");
var OneinchTrade = /** @class */ (function (_super) {
    __extends(OneinchTrade, _super);
    function OneinchTrade(oneinchTradeStruct) {
        var _this = _super.call(this, oneinchTradeStruct.from.blockchain) || this;
        _this.httpClient = injector_1.Injector.httpClient;
        _this.contractAddress = oneinchTradeStruct.contractAddress;
        _this.from = oneinchTradeStruct.from;
        _this.to = oneinchTradeStruct.to;
        _this.nativeSupportedFrom = (0, token_native_address_proxy_1.createTokenNativeAddressProxy)(oneinchTradeStruct.from, constants_1.oneinchApiParams.nativeAddress);
        _this.nativeSupportedTo = (0, token_native_address_proxy_1.createTokenNativeAddressProxy)(oneinchTradeStruct.to, constants_1.oneinchApiParams.nativeAddress);
        _this.gasFeeInfo = oneinchTradeStruct.gasFeeInfo || null;
        _this.slippageTolerance = oneinchTradeStruct.slippageTolerance;
        _this.disableMultihops = oneinchTradeStruct.disableMultihops;
        _this.path = oneinchTradeStruct.path;
        return _this;
    }
    OneinchTrade.checkIfNeedApproveAndThrowError = function (from) {
        return __awaiter(this, void 0, void 0, function () {
            var needApprove;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new OneinchTrade({
                            from: from
                        }).needApprove()];
                    case 1:
                        needApprove = _a.sent();
                        if (needApprove) {
                            throw new Error('need approve');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(OneinchTrade.prototype, "apiBaseUrl", {
        get: function () {
            return (0, utils_1.getOneinchApiBaseUrl)(this.from.blockchain);
        },
        enumerable: false,
        configurable: true
    });
    OneinchTrade.prototype.needApprove = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, allowance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.checkWalletConnected();
                        if (this.nativeSupportedFrom.isNative) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.httpClient.get("".concat(this.apiBaseUrl, "/approve/allowance"), {
                                params: {
                                    tokenAddress: this.nativeSupportedFrom.address,
                                    walletAddress: this.walletAddress
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        allowance = new bignumber_js_1.default(response.allowance);
                        return [2 /*return*/, allowance.lt(this.nativeSupportedFrom.weiAmount)];
                }
            });
        });
    };
    OneinchTrade.prototype.swap = function (options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var apiTradeData, _a, gas, gasPrice, transactionOptions, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.checkWalletState()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this.checkAllowanceAndApprove(options)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.getTradeData()];
                    case 4:
                        apiTradeData = _b.sent();
                        _a = this.getGasParamsFromApiTradeData(options, apiTradeData), gas = _a.gas, gasPrice = _a.gasPrice;
                        transactionOptions = {
                            onTransactionHash: options.onConfirm,
                            data: apiTradeData.tx.data,
                            gas: gas,
                            gasPrice: gasPrice
                        };
                        return [2 /*return*/, injector_1.Injector.web3Private.trySendTransaction(apiTradeData.tx.to, this.nativeSupportedFrom.isNative ? this.nativeSupportedFrom.stringWeiAmount : '0', transactionOptions)];
                    case 5:
                        err_1 = _b.sent();
                        this.specifyError(err_1);
                        throw new rubic_sdk_error_1.RubicSdkError(err_1.message || err_1.toString());
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    OneinchTrade.prototype.encode = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var apiTradeData, _a, gas, gasPrice, err_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getTradeData(options.fromAddress)];
                    case 1:
                        apiTradeData = _b.sent();
                        _a = this.getGasParamsFromApiTradeData(options, apiTradeData), gas = _a.gas, gasPrice = _a.gasPrice;
                        return [2 /*return*/, __assign(__assign({}, apiTradeData.tx), { gas: gas, gasPrice: gasPrice })];
                    case 2:
                        err_2 = _b.sent();
                        this.specifyError(err_2);
                        throw new rubic_sdk_error_1.RubicSdkError(err_2.message || err_2.toString());
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OneinchTrade.prototype.getTradeData = function (fromAddress) {
        var swapRequest = {
            params: __assign({ fromTokenAddress: this.nativeSupportedFrom.address, toTokenAddress: this.to.address, amount: this.nativeSupportedFrom.stringWeiAmount, slippage: (this.slippageTolerance * 100).toString(), fromAddress: fromAddress || this.walletAddress }, (this.disableMultihops && { mainRouteParts: '1' }))
        };
        return this.httpClient.get("".concat(this.apiBaseUrl, "/swap"), swapRequest);
    };
    OneinchTrade.prototype.getGasParamsFromApiTradeData = function (options, apiTradeData) {
        return this.getGasParams({
            gasLimit: options.gasLimit || apiTradeData.tx.gas.toString(),
            gasPrice: options.gasPrice || apiTradeData.tx.gasPrice
        });
    };
    OneinchTrade.prototype.specifyError = function (err) {
        var _this = this;
        var _a, _b, _c;
        if (err.error) {
            if ((_a = err.error.message) === null || _a === void 0 ? void 0 : _a.includes('cannot estimate')) {
                var nativeToken = blockchains_1.blockchains.find(function (el) { return el.name === _this.nativeSupportedFrom.blockchain; }).nativeCoin.symbol;
                var message = "1inch sets increased costs on gas fee. For transaction enter less ".concat(nativeToken, " amount or top up your ").concat(nativeToken, " balance.");
                throw new rubic_sdk_error_1.RubicSdkError(message);
            }
            if ((_b = err.error.message) === null || _b === void 0 ? void 0 : _b.includes('insufficient funds for transfer')) {
                throw new InsufficientFundsOneinchError_1.default();
            }
            if ((_c = err.error.description) === null || _c === void 0 ? void 0 : _c.includes('cannot estimate')) {
                throw new low_slippage_error_1.LowSlippageError();
            }
        }
    };
    __decorate([
        pure_decorator_1.Pure
    ], OneinchTrade.prototype, "apiBaseUrl", null);
    return OneinchTrade;
}(instant_trade_1.InstantTrade));
exports.OneinchTrade = OneinchTrade;
//# sourceMappingURL=oneinch-trade.js.map