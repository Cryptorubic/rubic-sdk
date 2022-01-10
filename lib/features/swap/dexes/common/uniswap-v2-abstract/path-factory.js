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
exports.PathFactory = void 0;
var insufficient_liquidity_error_1 = require("../../../../../common/errors/swap/insufficient-liquidity.error");
var object_1 = require("../../../../../common/utils/object");
var price_token_amount_1 = require("../../../../../core/blockchain/tokens/price-token-amount");
var token_1 = require("../../../../../core/blockchain/tokens/token");
var web3_pure_1 = require("../../../../../core/blockchain/web3-pure/web3-pure");
var injector_1 = require("../../../../../core/sdk/injector");
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var common_1 = require("../../../../../common");
var PathFactory = /** @class */ (function () {
    function PathFactory(uniswapProviderStruct, pathFactoryStruct) {
        this.web3Public = injector_1.Injector.web3PublicService.getWeb3Public(pathFactoryStruct.from.blockchain);
        this.from = pathFactoryStruct.from;
        this.to = pathFactoryStruct.to;
        this.weiAmount = pathFactoryStruct.weiAmount;
        this.exact = pathFactoryStruct.exact;
        this.options = pathFactoryStruct.options;
        this.InstantTradeClass = uniswapProviderStruct.InstantTradeClass;
        this.routingProvidersAddresses =
            uniswapProviderStruct.providerSettings.routingProvidersAddresses;
        this.maxTransitTokens = pathFactoryStruct.options.disableMultihops
            ? 0
            : uniswapProviderStruct.providerSettings.maxTransitTokens;
    }
    Object.defineProperty(PathFactory.prototype, "walletAddress", {
        get: function () {
            return injector_1.Injector.web3Private.address;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PathFactory.prototype, "stringWeiAmount", {
        get: function () {
            return this.weiAmount.toFixed(0);
        },
        enumerable: false,
        configurable: true
    });
    PathFactory.prototype.getAmountAndPath = function (gasPriceInUsd) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var routes, gasLimits_1, estimatedGasLimits, routesWithProfit, sortedByProfitRoutes, gasLimit, callData, estimatedGas;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getAllRoutes()];
                    case 1:
                        routes = (_b.sent()).sort(function (a, b) {
                            return b.outputAbsoluteAmount.comparedTo(a.outputAbsoluteAmount);
                        });
                        if (routes.length === 0) {
                            throw new insufficient_liquidity_error_1.InsufficientLiquidityError();
                        }
                        if (this.options.gasCalculation === 'disabled') {
                            return [2 /*return*/, {
                                    route: routes[0]
                                }];
                        }
                        if (!(this.options.gasCalculation === 'rubicOptimisation' &&
                            ((_a = this.to.price) === null || _a === void 0 ? void 0 : _a.isFinite()) &&
                            gasPriceInUsd)) return [3 /*break*/, 4];
                        gasLimits_1 = this.getDefaultGases(routes);
                        if (!this.walletAddress) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.web3Public.batchEstimatedGas(this.InstantTradeClass.contractAbi, this.InstantTradeClass.getContractAddress(this.from.blockchain), this.walletAddress, this.getGasRequests(routes))];
                    case 2:
                        estimatedGasLimits = _b.sent();
                        estimatedGasLimits.forEach(function (elem, index) {
                            if (elem === null || elem === void 0 ? void 0 : elem.isFinite()) {
                                gasLimits_1[index] = elem;
                            }
                        });
                        _b.label = 3;
                    case 3:
                        routesWithProfit = routes.map(function (route, index) {
                            var estimatedGas = gasLimits_1[index];
                            var gasFeeInUsd = estimatedGas.multipliedBy(gasPriceInUsd);
                            var profit;
                            if (_this.exact === 'input') {
                                profit = web3_pure_1.Web3Pure.fromWei(route.outputAbsoluteAmount, _this.to.decimals)
                                    .multipliedBy(_this.to.price)
                                    .minus(gasFeeInUsd);
                            }
                            else {
                                profit = web3_pure_1.Web3Pure.fromWei(route.outputAbsoluteAmount, _this.from.decimals)
                                    .multipliedBy(_this.from.price)
                                    .multipliedBy(-1)
                                    .minus(gasFeeInUsd);
                            }
                            return {
                                route: route,
                                estimatedGas: estimatedGas,
                                profit: profit
                            };
                        });
                        sortedByProfitRoutes = routesWithProfit.sort(function (a, b) {
                            return b.profit.comparedTo(a.profit);
                        });
                        return [2 /*return*/, sortedByProfitRoutes[0]];
                    case 4:
                        gasLimit = this.getDefaultGases(routes.slice(0, 1))[0];
                        if (!this.walletAddress) return [3 /*break*/, 6];
                        callData = this.getGasRequests(routes.slice(0, 1))[0];
                        return [4 /*yield*/, this.web3Public.getEstimatedGas(this.InstantTradeClass.contractAbi, this.InstantTradeClass.getContractAddress(this.from.blockchain), callData.contractMethod, callData.params, this.walletAddress, callData.value)];
                    case 5:
                        estimatedGas = _b.sent();
                        if (estimatedGas === null || estimatedGas === void 0 ? void 0 : estimatedGas.isFinite()) {
                            gasLimit = estimatedGas;
                        }
                        _b.label = 6;
                    case 6: return [2 /*return*/, {
                            route: routes[0],
                            estimatedGas: gasLimit
                        }];
                }
            });
        });
    };
    PathFactory.prototype.getGasRequests = function (routes) {
        return this.getTradesByRoutes(routes).map(function (trade) { return trade.getEstimatedGasCallData(); });
    };
    PathFactory.prototype.getDefaultGases = function (routes) {
        return this.getTradesByRoutes(routes).map(function (trade) { return trade.getDefaultEstimatedGas(); });
    };
    PathFactory.prototype.getTradesByRoutes = function (routes) {
        var _this = this;
        return routes.map(function (route) {
            var fromAmount = _this.exact === 'input' ? _this.weiAmount : route.outputAbsoluteAmount;
            var toAmount = _this.exact === 'output' ? _this.weiAmount : route.outputAbsoluteAmount;
            return new _this.InstantTradeClass({
                from: new price_token_amount_1.PriceTokenAmount(__assign(__assign({}, _this.from.asStruct), { weiAmount: fromAmount })),
                to: new price_token_amount_1.PriceTokenAmount(__assign(__assign({}, _this.to.asStruct), { weiAmount: toAmount })),
                wrappedPath: route.path,
                exact: _this.exact,
                deadlineMinutes: _this.options.deadlineMinutes,
                slippageTolerance: _this.options.slippageTolerance
            });
        });
    };
    PathFactory.prototype.getAllRoutes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var transitTokens, vertexes, initialPath, routesPaths, routesMethodArguments, recGraphVisitor, i, responses;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, token_1.Token.createTokens(this.routingProvidersAddresses, this.from.blockchain)];
                    case 1:
                        transitTokens = _a.sent();
                        vertexes = transitTokens.filter(function (elem) { return !elem.isEqualTo(_this.from) && !elem.isEqualTo(_this.to); });
                        initialPath = [this.from];
                        routesPaths = [];
                        routesMethodArguments = [];
                        recGraphVisitor = function (path, transitTokensLimit) {
                            if (path.length === transitTokensLimit + 1) {
                                var finalPath = path.concat(_this.to);
                                routesPaths.push(finalPath);
                                routesMethodArguments.push([
                                    _this.stringWeiAmount,
                                    token_1.Token.tokensToAddresses(finalPath)
                                ]);
                                return;
                            }
                            vertexes
                                .filter(function (vertex) { return path.every(function (token) { return !token.isEqualTo(vertex); }); })
                                .forEach(function (vertex) {
                                var extendedPath = path.concat(vertex);
                                recGraphVisitor(extendedPath, transitTokensLimit);
                            });
                        };
                        for (i = 0; i <= this.maxTransitTokens; i++) {
                            recGraphVisitor(initialPath, i);
                        }
                        return [4 /*yield*/, this.InstantTradeClass.callForRoutes(this.from.blockchain, this.exact, routesMethodArguments)];
                    case 2:
                        responses = _a.sent();
                        return [2 /*return*/, responses
                                .map(function (response, index) {
                                if (!response.success || !response.output) {
                                    return null;
                                }
                                var amounts = response.output.amounts;
                                var amount = new bignumber_js_1.default(_this.exact === 'input' ? amounts[amounts.length - 1] : amounts[0]);
                                return {
                                    outputAbsoluteAmount: amount,
                                    path: routesPaths[index]
                                };
                            })
                                .filter(object_1.notNull)];
                }
            });
        });
    };
    __decorate([
        common_1.Cache
    ], PathFactory.prototype, "stringWeiAmount", null);
    return PathFactory;
}());
exports.PathFactory = PathFactory;
//# sourceMappingURL=path-factory.js.map