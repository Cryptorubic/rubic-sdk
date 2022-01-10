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
exports.UniswapV2AbstractTrade = void 0;
var cache_decorator_1 = require("../../../../../common/decorators/cache.decorator");
var rubic_sdk_error_1 = require("../../../../../common/errors/rubic-sdk.error");
var low_slippage_deflationary_token_error_1 = require("../../../../../common/errors/swap/low-slippage-deflationary-token.error");
var low_slippage_error_1 = require("../../../../../common/errors/swap/low-slippage.error");
var functions_1 = require("../../../../../common/utils/functions");
var web3_pure_1 = require("../../../../../core/blockchain/web3-pure/web3-pure");
var token_native_address_proxy_1 = require("../utils/token-native-address-proxy");
var injector_1 = require("../../../../../core/sdk/injector");
var instant_trade_1 = require("../../../instant-trade");
var default_estimated_gas_1 = require("./constants/default-estimated-gas");
var SWAP_METHOD_1 = require("./constants/SWAP_METHOD");
var uniswap_v2_abi_1 = require("./constants/uniswap-v2-abi");
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var options_1 = require("../../../../../common/utils/options");
var UniswapV2AbstractTrade = /** @class */ (function (_super) {
    __extends(UniswapV2AbstractTrade, _super);
    function UniswapV2AbstractTrade(tradeStruct) {
        var _this = _super.call(this, tradeStruct.from.blockchain) || this;
        _this.from = tradeStruct.from;
        _this.to = tradeStruct.to;
        _this.gasFeeInfo = tradeStruct.gasFeeInfo || null;
        _this.deadlineMinutes = tradeStruct.deadlineMinutes;
        _this.exact = tradeStruct.exact;
        _this.slippageTolerance = tradeStruct.slippageTolerance;
        _this.wrappedPath = tradeStruct.wrappedPath;
        _this.path = (0, token_native_address_proxy_1.createTokenNativeAddressProxyInPathStartAndEnd)(_this.wrappedPath, web3_pure_1.Web3Pure.nativeTokenAddress);
        return _this;
    }
    UniswapV2AbstractTrade.getContractAddress = function (blockchain) {
        try {
            // see  https://github.com/microsoft/TypeScript/issues/34516
            // @ts-ignore
            var instance = new this({
                from: { blockchain: blockchain },
                wrappedPath: [{ isNative: function () { return false; } }, { isNative: function () { return false; } }]
            });
            if (!instance.contractAddress) {
                throw new rubic_sdk_error_1.RubicSdkError('Trying to read abstract class field');
            }
            return instance.contractAddress;
        }
        catch (e) {
            console.debug(e);
            throw new rubic_sdk_error_1.RubicSdkError('Trying to read abstract class field');
        }
    };
    Object.defineProperty(UniswapV2AbstractTrade, "type", {
        get: function () {
            throw new rubic_sdk_error_1.RubicSdkError("Static TRADE_TYPE getter is not implemented by ".concat(this.name));
        },
        enumerable: false,
        configurable: true
    });
    UniswapV2AbstractTrade.callForRoutes = function (blockchain, exact, routesMethodArguments) {
        var web3Public = injector_1.Injector.web3PublicService.getWeb3Public(blockchain);
        var methodName = exact === 'input' ? 'getAmountsOut' : 'getAmountsIn';
        return web3Public.multicallContractMethod(this.getContractAddress(blockchain), this.contractAbi, methodName, routesMethodArguments);
    };
    Object.defineProperty(UniswapV2AbstractTrade.prototype, "type", {
        get: function () {
            return this.constructor.type;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UniswapV2AbstractTrade.prototype, "settings", {
        set: function (value) {
            this.deadlineMinutes = value.deadlineMinutes || this.deadlineMinutes;
            this.slippageTolerance = value.slippageTolerance || this.slippageTolerance;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UniswapV2AbstractTrade.prototype, "deadlineMinutesTimestamp", {
        get: function () {
            return (0, options_1.deadlineMinutesTimestamp)(this.deadlineMinutes);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UniswapV2AbstractTrade.prototype, "nativeValueToSend", {
        get: function () {
            if (this.from.isNative) {
                return this.getAmountInAndAmountOut().amountIn;
            }
            return undefined;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UniswapV2AbstractTrade.prototype, "callParameters", {
        get: function () {
            var _a = this.getAmountInAndAmountOut(), amountIn = _a.amountIn, amountOut = _a.amountOut;
            var amountParameters = this.from.isNative ? [amountOut] : [amountIn, amountOut];
            return __spreadArray(__spreadArray([], amountParameters, true), [
                this.wrappedPath.map(function (t) { return t.address; }),
                this.walletAddress,
                this.deadlineMinutesTimestamp
            ], false);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UniswapV2AbstractTrade.prototype, "regularSwapMethod", {
        get: function () {
            return this.constructor.swapMethods[this.exact][this.regularSwapMethodKey];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UniswapV2AbstractTrade.prototype, "supportedFeeSwapMethod", {
        get: function () {
            return this.constructor.swapMethods[this.exact][SWAP_METHOD_1.SUPPORTING_FEE_SWAP_METHODS_MAPPING[this.regularSwapMethodKey]];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UniswapV2AbstractTrade.prototype, "regularSwapMethodKey", {
        get: function () {
            if (this.from.isNative) {
                return 'ETH_TO_TOKENS';
            }
            if (this.to.isNative) {
                return 'TOKENS_TO_ETH';
            }
            return 'TOKENS_TO_TOKENS';
        },
        enumerable: false,
        configurable: true
    });
    UniswapV2AbstractTrade.prototype.getAmountInAndAmountOut = function () {
        var amountIn = this.from.stringWeiAmount;
        var amountOut = this.toTokenAmountMin.stringWeiAmount;
        if (this.exact === 'output') {
            amountIn = this.from.weiAmountPlusSlippage(this.slippageTolerance).toFixed(0);
            amountOut = this.to.stringWeiAmount;
        }
        return { amountIn: amountIn, amountOut: amountOut };
    };
    UniswapV2AbstractTrade.prototype.swap = function (options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkWalletState()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.checkAllowanceAndApprove(options)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, this.createAnyToAnyTrade(options)];
                }
            });
        });
    };
    UniswapV2AbstractTrade.prototype.createAnyToAnyTrade = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var methodName, swapParameters;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getMethodName(options)];
                    case 1:
                        methodName = _b.sent();
                        swapParameters = this.getSwapParametersByMethod(methodName, options);
                        return [2 /*return*/, (_a = injector_1.Injector.web3Private).executeContractMethod.apply(_a, swapParameters)];
                }
            });
        });
    };
    UniswapV2AbstractTrade.prototype.encode = function (options) {
        return this.encodeAnyToAnyTrade(options);
    };
    UniswapV2AbstractTrade.prototype.encodeAnyToAnyTrade = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var methodName, gasParams;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getMethodName(options, options.fromAddress)];
                    case 1:
                        methodName = _a.sent();
                        gasParams = this.getGasParams(options);
                        return [2 /*return*/, web3_pure_1.Web3Pure.encodeMethodCall(this.contractAddress, this.constructor.contractAbi, methodName, this.callParameters, this.nativeValueToSend, gasParams)];
                }
            });
        });
    };
    UniswapV2AbstractTrade.prototype.getMethodName = function (options, fromAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var regularParameters, supportedFeeParameters, regularMethodResult, feeMethodResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        regularParameters = this.getSwapParametersByMethod(this.regularSwapMethod, options);
                        supportedFeeParameters = this.getSwapParametersByMethod(this.supportedFeeSwapMethod, options);
                        return [4 /*yield*/, (0, functions_1.tryExecuteAsync)(this.web3Public.callContractMethod, this.convertSwapParametersToCallParameters(regularParameters, fromAddress))];
                    case 1:
                        regularMethodResult = _a.sent();
                        return [4 /*yield*/, (0, functions_1.tryExecuteAsync)(this.web3Public.callContractMethod, this.convertSwapParametersToCallParameters(supportedFeeParameters, fromAddress))];
                    case 2:
                        feeMethodResult = _a.sent();
                        if (regularMethodResult.success) {
                            if (feeMethodResult.success) {
                                return [2 /*return*/, this.regularSwapMethod];
                            }
                            throw new low_slippage_deflationary_token_error_1.LowSlippageDeflationaryTokenError();
                        }
                        if (feeMethodResult.success) {
                            return [2 /*return*/, this.supportedFeeSwapMethod];
                        }
                        throw new low_slippage_error_1.LowSlippageError();
                }
            });
        });
    };
    UniswapV2AbstractTrade.prototype.getSwapParametersByMethod = function (method, options) {
        var value = this.nativeValueToSend;
        var _a = this.getGasParams(options), gas = _a.gas, gasPrice = _a.gasPrice;
        return [
            this.contractAddress,
            this.constructor.contractAbi,
            method,
            this.callParameters,
            {
                onTransactionHash: options.onConfirm,
                value: value,
                gas: gas,
                gasPrice: gasPrice
            }
        ];
    };
    UniswapV2AbstractTrade.prototype.convertSwapParametersToCallParameters = function (parameters, fromAddress) {
        var _a, _b;
        return parameters.slice(0, 3).concat([
            __assign({ methodArguments: parameters[3], from: fromAddress || injector_1.Injector.web3Private.address }, (((_a = parameters[4]) === null || _a === void 0 ? void 0 : _a.value) && { value: (_b = parameters[4]) === null || _b === void 0 ? void 0 : _b.value }))
        ]);
    };
    UniswapV2AbstractTrade.prototype.getEstimatedGasCallData = function () {
        return this.estimateGasForAnyToAnyTrade();
    };
    UniswapV2AbstractTrade.prototype.getDefaultEstimatedGas = function () {
        return new bignumber_js_1.default(this.getGasLimit());
    };
    UniswapV2AbstractTrade.prototype.estimateGasForAnyToAnyTrade = function () {
        var value = this.nativeValueToSend;
        return __assign({ contractMethod: this.regularSwapMethod, params: this.callParameters }, (value && { value: value }));
    };
    UniswapV2AbstractTrade.prototype.getGasLimit = function (options) {
        var gasLimit = _super.prototype.getGasLimit.call(this, options);
        if (gasLimit) {
            return gasLimit;
        }
        var transitTokensNumber = this.wrappedPath.length - 2;
        var methodName = 'tokensToTokens';
        if (this.from.isNative) {
            methodName = 'ethToTokens';
        }
        if (this.to.isNative) {
            methodName = 'tokensToEth';
        }
        return this.constructor.defaultEstimatedGasInfo[methodName][transitTokensNumber].toFixed(0);
    };
    UniswapV2AbstractTrade.contractAbi = uniswap_v2_abi_1.defaultUniswapV2Abi;
    UniswapV2AbstractTrade.swapMethods = SWAP_METHOD_1.SWAP_METHOD;
    UniswapV2AbstractTrade.defaultEstimatedGasInfo = default_estimated_gas_1.defaultEstimatedGas;
    __decorate([
        cache_decorator_1.Cache
    ], UniswapV2AbstractTrade, "getContractAddress", null);
    return UniswapV2AbstractTrade;
}(instant_trade_1.InstantTrade));
exports.UniswapV2AbstractTrade = UniswapV2AbstractTrade;
//# sourceMappingURL=uniswap-v2-abstract-trade.js.map