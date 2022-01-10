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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniSwapV3Trade = void 0;
var options_1 = require("../../../../../common/utils/options");
var instant_trade_1 = require("../../../instant-trade");
var price_token_amount_1 = require("../../../../../core/blockchain/tokens/price-token-amount");
var BLOCKCHAIN_NAME_1 = require("../../../../../core/blockchain/models/BLOCKCHAIN_NAME");
var swap_router_contract_data_1 = require("./constants/swap-router-contract-data");
var common_1 = require("../../../../../common");
var features_1 = require("../../../..");
var blockchain_1 = require("../../../../../common/utils/blockchain");
var liquidity_pools_controller_1 = require("./utils/liquidity-pool-controller/liquidity-pools-controller");
var web3_pure_1 = require("../../../../../core/blockchain/web3-pure/web3-pure");
var estimated_gas_1 = require("./constants/estimated-gas");
var injector_1 = require("../../../../../core/sdk/injector");
var UniSwapV3Trade = /** @class */ (function (_super) {
    __extends(UniSwapV3Trade, _super);
    function UniSwapV3Trade(tradeStruct) {
        var _this = _super.call(this, BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.ETHEREUM) || this;
        _this.contractAddress = swap_router_contract_data_1.swapRouterContractAddress;
        _this.from = tradeStruct.from;
        _this.to = tradeStruct.to;
        _this.gasFeeInfo = tradeStruct.gasFeeInfo || null;
        _this.slippageTolerance = tradeStruct.slippageTolerance;
        _this.deadlineMinutes = tradeStruct.deadlineMinutes;
        _this.route = tradeStruct.route;
        return _this;
    }
    UniSwapV3Trade.estimateGasLimitForRoute = function (from, toToken, options, route) {
        return __awaiter(this, void 0, void 0, function () {
            var estimateGasParams, gasLimit, walletAddress, web3Public, estimatedGas;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        estimateGasParams = UniSwapV3Trade.getEstimateGasParams(from, toToken, options, route);
                        gasLimit = estimateGasParams.defaultGasLimit;
                        walletAddress = injector_1.Injector.web3Private.address;
                        if (!walletAddress) return [3 /*break*/, 2];
                        web3Public = injector_1.Injector.web3PublicService.getWeb3Public(from.blockchain);
                        return [4 /*yield*/, web3Public.getEstimatedGas(swap_router_contract_data_1.swapRouterContractAbi, swap_router_contract_data_1.swapRouterContractAddress, estimateGasParams.callData.contractMethod, estimateGasParams.callData.params, walletAddress, estimateGasParams.callData.value)];
                    case 1:
                        estimatedGas = _a.sent();
                        if (estimatedGas === null || estimatedGas === void 0 ? void 0 : estimatedGas.isFinite()) {
                            gasLimit = estimatedGas;
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/, gasLimit];
                }
            });
        });
    };
    UniSwapV3Trade.estimateGasLimitForRoutes = function (from, toToken, options, routes) {
        return __awaiter(this, void 0, void 0, function () {
            var routesEstimateGasParams, gasLimits, walletAddress, web3Public, estimatedGasLimits;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        routesEstimateGasParams = routes.map(function (route) {
                            return UniSwapV3Trade.getEstimateGasParams(from, toToken, options, route);
                        });
                        gasLimits = routesEstimateGasParams.map(function (estimateGasParams) { return estimateGasParams.defaultGasLimit; });
                        walletAddress = injector_1.Injector.web3Private.address;
                        if (!walletAddress) return [3 /*break*/, 2];
                        web3Public = injector_1.Injector.web3PublicService.getWeb3Public(from.blockchain);
                        return [4 /*yield*/, web3Public.batchEstimatedGas(swap_router_contract_data_1.swapRouterContractAbi, swap_router_contract_data_1.swapRouterContractAddress, walletAddress, routesEstimateGasParams.map(function (estimateGasParams) { return estimateGasParams.callData; }))];
                    case 1:
                        estimatedGasLimits = _a.sent();
                        estimatedGasLimits.forEach(function (elem, index) {
                            if (elem === null || elem === void 0 ? void 0 : elem.isFinite()) {
                                gasLimits[index] = elem;
                            }
                        });
                        _a.label = 2;
                    case 2: return [2 /*return*/, gasLimits];
                }
            });
        });
    };
    UniSwapV3Trade.getEstimateGasParams = function (from, toToken, options, route) {
        return new UniSwapV3Trade({
            from: from,
            to: new price_token_amount_1.PriceTokenAmount(__assign(__assign({}, toToken.asStruct), { weiAmount: route.outputAbsoluteAmount })),
            slippageTolerance: options.slippageTolerance,
            deadlineMinutes: options.deadlineMinutes,
            route: route
        }).getEstimateGasParams();
    };
    Object.defineProperty(UniSwapV3Trade.prototype, "type", {
        get: function () {
            return features_1.TRADE_TYPE.UNISWAP_V3;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UniSwapV3Trade.prototype, "deadlineMinutesTimestamp", {
        get: function () {
            return (0, options_1.deadlineMinutesTimestamp)(this.deadlineMinutes);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UniSwapV3Trade.prototype, "path", {
        get: function () {
            var initialPool = this.route.poolsPath[0];
            var path = [
                (0, blockchain_1.compareAddresses)(initialPool.token0.address, this.route.initialTokenAddress)
                    ? initialPool.token0
                    : initialPool.token1
            ];
            return path.concat.apply(path, this.route.poolsPath.map(function (pool) {
                return !(0, blockchain_1.compareAddresses)(pool.token0.address, path[path.length - 1].address)
                    ? pool.token0
                    : pool.token1;
            }));
        },
        enumerable: false,
        configurable: true
    });
    UniSwapV3Trade.prototype.swap = function (options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, methodName, methodArguments, _b, gas, gasPrice;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.checkWalletState()];
                    case 1:
                        _c.sent();
                        _a = this.getSwapRouterMethodData(), methodName = _a.methodName, methodArguments = _a.methodArguments;
                        _b = this.getGasParams(options), gas = _b.gas, gasPrice = _b.gasPrice;
                        return [2 /*return*/, injector_1.Injector.web3Private.tryExecuteContractMethod(swap_router_contract_data_1.swapRouterContractAddress, swap_router_contract_data_1.swapRouterContractAbi, methodName, methodArguments, {
                                value: this.from.isNative ? this.from.stringWeiAmount : undefined,
                                onTransactionHash: options.onConfirm,
                                gas: gas,
                                gasPrice: gasPrice
                            })];
                }
            });
        });
    };
    UniSwapV3Trade.prototype.encode = function (options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, methodName, methodArguments, gasParams;
            return __generator(this, function (_b) {
                _a = this.getSwapRouterMethodData(), methodName = _a.methodName, methodArguments = _a.methodArguments;
                gasParams = this.getGasParams(options);
                return [2 /*return*/, web3_pure_1.Web3Pure.encodeMethodCall(swap_router_contract_data_1.swapRouterContractAddress, swap_router_contract_data_1.swapRouterContractAbi, methodName, methodArguments, this.from.isNative ? this.from.stringWeiAmount : undefined, gasParams)];
            });
        });
    };
    UniSwapV3Trade.prototype.getSwapRouterMethodData = function () {
        if (!this.to.isNative) {
            var _a = this.getSwapRouterExactInputMethodData(this.walletAddress), exactInputMethodName_1 = _a.methodName, exactInputMethodArguments_1 = _a.methodArguments;
            return {
                methodName: exactInputMethodName_1,
                methodArguments: exactInputMethodArguments_1
            };
        }
        var _b = this.getSwapRouterExactInputMethodData(web3_pure_1.Web3Pure.ZERO_ADDRESS), exactInputMethodName = _b.methodName, exactInputMethodArguments = _b.methodArguments;
        var exactInputMethodEncoded = web3_pure_1.Web3Pure.encodeFunctionCall(swap_router_contract_data_1.swapRouterContractAbi, exactInputMethodName, exactInputMethodArguments);
        var amountOutMin = this.to.weiAmountMinusSlippage(this.slippageTolerance).toFixed(0);
        var unwrapWETHMethodEncoded = web3_pure_1.Web3Pure.encodeFunctionCall(swap_router_contract_data_1.swapRouterContractAbi, 'unwrapWETH9', [amountOutMin, this.walletAddress]);
        return {
            methodName: 'multicall',
            methodArguments: [[exactInputMethodEncoded, unwrapWETHMethodEncoded]]
        };
    };
    /**
     * Returns swap `exactInput` method's name and arguments to use in Swap contract.
     */
    UniSwapV3Trade.prototype.getSwapRouterExactInputMethodData = function (walletAddress) {
        var amountOutMin = this.from.weiAmountMinusSlippage(this.slippageTolerance).toFixed(0);
        if (this.route.poolsPath.length === 1) {
            return {
                methodName: 'exactInputSingle',
                methodArguments: [
                    [
                        this.route.initialTokenAddress,
                        this.to.address,
                        this.route.poolsPath[0].fee,
                        walletAddress,
                        this.deadlineMinutesTimestamp,
                        this.from.weiAmount,
                        amountOutMin,
                        0
                    ]
                ]
            };
        }
        return {
            methodName: 'exactInput',
            methodArguments: [
                [
                    liquidity_pools_controller_1.LiquidityPoolsController.getEncodedPoolsPath(this.route.poolsPath, this.route.initialTokenAddress),
                    walletAddress,
                    this.deadlineMinutesTimestamp,
                    this.from.weiAmount,
                    amountOutMin
                ]
            ]
        };
    };
    /**
     * Returns encoded data of estimated gas function and default estimated gas.
     */
    UniSwapV3Trade.prototype.getEstimateGasParams = function () {
        var defaultEstimateGas = estimated_gas_1.swapEstimatedGas[this.route.poolsPath.length - 1].plus(this.from.isNative ? estimated_gas_1.WethToEthEstimatedGas : 0);
        var _a = this.getSwapRouterMethodData(), methodName = _a.methodName, methodArguments = _a.methodArguments;
        return {
            callData: {
                contractMethod: methodName,
                params: methodArguments,
                value: this.from.isNative ? this.from.stringWeiAmount : undefined
            },
            defaultGasLimit: defaultEstimateGas
        };
    };
    __decorate([
        common_1.Cache
    ], UniSwapV3Trade.prototype, "path", null);
    return UniSwapV3Trade;
}(instant_trade_1.InstantTrade));
exports.UniSwapV3Trade = UniSwapV3Trade;
//# sourceMappingURL=uni-swap-v3-trade.js.map