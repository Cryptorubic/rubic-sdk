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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossChainManager = void 0;
var CrossChainSupportedBlockchains_1 = require("@features/cross-chain/constants/CrossChainSupportedBlockchains");
var crossChainContracts_1 = require("@features/cross-chain/constants/crossChainContracts");
var token_1 = require("@core/blockchain/tokens/token");
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var blockchain_1 = require("@common/utils/blockchain");
var price_token_amount_1 = require("@core/blockchain/tokens/price-token-amount");
var web3_pure_1 = require("@core/blockchain/web3-pure/web3-pure");
var DirectContractTrade_1 = require("@features/cross-chain/models/ContractTrade/DirectContractTrade");
var ItContractTrade_1 = require("@features/cross-chain/models/ContractTrade/ItContractTrade");
var cross_chain_trade_1 = require("@features/cross-chain/cross-chain-trade/cross-chain-trade");
var injector_1 = require("@core/sdk/injector");
var insufficient_liquidity_error_1 = require("@common/errors/swap/insufficient-liquidity-error");
var NotSupportedBlockchain_1 = require("@common/errors/swap/NotSupportedBlockchain");
var object_1 = require("@common/utils/object");
var price_token_1 = require("@core/blockchain/tokens/price-token");
var rubic_sdk_error_1 = require("@common/errors/rubic-sdk-error");
var options_1 = require("@common/utils/options");
var tokens_1 = require("@common/utils/tokens");
var CrossChainManager = /** @class */ (function () {
    function CrossChainManager() {
        this.contracts = crossChainContracts_1.crossChainContracts;
        this.getWeb3Public = injector_1.Injector.web3PublicService.getWeb3Public;
    }
    CrossChainManager.isSupportedBlockchain = function (blockchain) {
        return CrossChainSupportedBlockchains_1.crossChainSupportedBlockchains.some(function (supportedBlockchain) { return supportedBlockchain === blockchain; });
    };
    CrossChainManager.prototype.calculateTrade = function (fromToken, fromAmount, toToken, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, from, to;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (toToken instanceof token_1.Token && fromToken.blockchain === toToken.blockchain) {
                            throw new rubic_sdk_error_1.RubicSdkError('Blockchains of from and to tokens must be different.');
                        }
                        return [4 /*yield*/, (0, tokens_1.getPriceTokensFromInputTokens)(fromToken, fromAmount, toToken)];
                    case 1:
                        _a = _b.sent(), from = _a.from, to = _a.to;
                        return [2 /*return*/, this.calculateTradeFromTokens(from, to, this.getFullOptions(options))];
                }
            });
        });
    };
    CrossChainManager.prototype.getFullOptions = function (options) {
        return (0, options_1.combineOptions)(options, {
            fromSlippageTolerance: 0.02,
            toSlippageTolerance: 0.02
        });
    };
    CrossChainManager.prototype.calculateTradeFromTokens = function (from, toToken, options) {
        return __awaiter(this, void 0, void 0, function () {
            var fromBlockchain, toBlockchain, fromSlippageTolerance, fromTrade, _a, toTransitTokenAmount, transitFeeToken, toSlippageTolerance, toTrade, _b, _c, cryptoFeeToken, gasData, minMaxAmountsErrors;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        fromBlockchain = from.blockchain;
                        toBlockchain = toToken.blockchain;
                        if (!CrossChainManager.isSupportedBlockchain(fromBlockchain)) {
                            throw new NotSupportedBlockchain_1.NotSupportedBlockchain();
                        }
                        if (!CrossChainManager.isSupportedBlockchain(toBlockchain)) {
                            throw new NotSupportedBlockchain_1.NotSupportedBlockchain();
                        }
                        fromSlippageTolerance = options.fromSlippageTolerance;
                        return [4 /*yield*/, this.calculateBestFromTrade(fromBlockchain, from, fromSlippageTolerance)];
                    case 1:
                        fromTrade = _d.sent();
                        return [4 /*yield*/, this.getToTransitTokenAmount(fromTrade)];
                    case 2:
                        _a = _d.sent(), toTransitTokenAmount = _a.toTransitTokenAmount, transitFeeToken = _a.transitFeeToken;
                        toSlippageTolerance = options.toSlippageTolerance;
                        return [4 /*yield*/, this.calculateBestToTrade(toBlockchain, toTransitTokenAmount, toToken, toSlippageTolerance)];
                    case 3:
                        toTrade = _d.sent();
                        return [4 /*yield*/, Promise.all([
                                this.getCryptoFeeTokenAndGasData(fromTrade, toTrade),
                                this.getMinMaxAmountsErrors(fromTrade)
                            ])];
                    case 4:
                        _b = _d.sent(), _c = _b[0], cryptoFeeToken = _c.cryptoFeeToken, gasData = _c.gasData, minMaxAmountsErrors = _b[1];
                        return [2 /*return*/, new cross_chain_trade_1.CrossChainTrade({
                                fromTrade: fromTrade,
                                toTrade: toTrade,
                                cryptoFeeToken: cryptoFeeToken,
                                transitFeeToken: transitFeeToken,
                                minMaxAmountsErrors: minMaxAmountsErrors,
                                gasData: gasData
                            })];
                }
            });
        });
    };
    CrossChainManager.prototype.calculateBestFromTrade = function (blockchain, from, slippageTolerance) {
        return __awaiter(this, void 0, void 0, function () {
            var promises;
            var _this = this;
            return __generator(this, function (_a) {
                promises = this.contracts[blockchain].map(function (contract) { return __awaiter(_this, void 0, void 0, function () {
                    var toToken, toPriceToken;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, contract.getTransitToken()];
                            case 1:
                                toToken = _b.sent();
                                toPriceToken = new price_token_1.PriceToken(__assign(__assign({}, toToken), { price: new bignumber_js_1.default(NaN) }));
                                _a = {
                                    contract: contract
                                };
                                return [4 /*yield*/, this.getCalculatedTrade(contract, from, toPriceToken, slippageTolerance)];
                            case 2: return [2 /*return*/, (_a.trade = _b.sent(),
                                    _a)];
                        }
                    });
                }); });
                return [2 /*return*/, this.getBestContractTrade(blockchain, slippageTolerance, promises)];
            });
        });
    };
    CrossChainManager.prototype.getToTransitTokenAmount = function (fromTrade) {
        return __awaiter(this, void 0, void 0, function () {
            var fromTransitToken, fromTransitTokenMinAmount, feeInPercents, transitFeeToken, toTransitTokenAmount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fromTransitToken = fromTrade.toToken;
                        fromTransitTokenMinAmount = fromTrade.toAmountMin;
                        return [4 /*yield*/, fromTrade.contract.getFeeInPercents()];
                    case 1:
                        feeInPercents = _a.sent();
                        transitFeeToken = new price_token_amount_1.PriceTokenAmount(__assign(__assign({}, fromTransitToken.asStruct), { tokenAmount: fromTransitTokenMinAmount.multipliedBy(feeInPercents) }));
                        toTransitTokenAmount = fromTransitTokenMinAmount.minus(transitFeeToken.tokenAmount);
                        return [2 /*return*/, {
                                toTransitTokenAmount: toTransitTokenAmount,
                                transitFeeToken: transitFeeToken
                            }];
                }
            });
        });
    };
    CrossChainManager.prototype.calculateBestToTrade = function (blockchain, fromAmount, toToken, slippageTolerance) {
        return __awaiter(this, void 0, void 0, function () {
            var promises;
            var _this = this;
            return __generator(this, function (_a) {
                promises = this.contracts[blockchain].map(function (contract) { return __awaiter(_this, void 0, void 0, function () {
                    var fromToken, from;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, contract.getTransitToken()];
                            case 1:
                                fromToken = _b.sent();
                                from = new price_token_amount_1.PriceTokenAmount(__assign(__assign({}, fromToken), { tokenAmount: fromAmount, price: new bignumber_js_1.default(NaN) }));
                                _a = {
                                    contract: contract
                                };
                                return [4 /*yield*/, this.getCalculatedTrade(contract, from, toToken, slippageTolerance)];
                            case 2: return [2 /*return*/, (_a.trade = _b.sent(),
                                    _a)];
                        }
                    });
                }); });
                return [2 /*return*/, this.getBestContractTrade(blockchain, slippageTolerance, promises)];
            });
        });
    };
    CrossChainManager.prototype.getBestContractTrade = function (blockchain, slippageTolerance, promises) {
        return __awaiter(this, void 0, void 0, function () {
            var calculatedContractTrade, bestContract;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.allSettled(promises).then(function (results) { return __awaiter(_this, void 0, void 0, function () {
                            var sortedResults;
                            return __generator(this, function (_a) {
                                sortedResults = results
                                    .map(function (result) {
                                    if (result.status === 'fulfilled') {
                                        return result.value;
                                    }
                                    return null;
                                })
                                    .filter(object_1.notNull)
                                    .sort(function (a, b) { return b.trade.toAmount.comparedTo(a.trade.toAmount); });
                                if (!sortedResults.length) {
                                    throw results[0].reason;
                                }
                                return [2 /*return*/, sortedResults[0]];
                            });
                        }); })];
                    case 1:
                        calculatedContractTrade = _a.sent();
                        bestContract = calculatedContractTrade.contract;
                        if ('instantTrade' in calculatedContractTrade.trade) {
                            return [2 /*return*/, new ItContractTrade_1.ItContractTrade(blockchain, bestContract, slippageTolerance, calculatedContractTrade.trade.instantTrade)];
                        }
                        return [2 /*return*/, new DirectContractTrade_1.DirectContractTrade(blockchain, bestContract, calculatedContractTrade.trade.token)];
                }
            });
        });
    };
    CrossChainManager.prototype.getCalculatedTrade = function (contract, from, toToken, slippageTolerance) {
        return __awaiter(this, void 0, void 0, function () {
            var instantTrade;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!(0, blockchain_1.compareAddresses)(from.address, toToken.address)) return [3 /*break*/, 2];
                        return [4 /*yield*/, contract.uniswapV2Provider.calculate(from, toToken, {
                                gasCalculation: 'disabled',
                                slippageTolerance: slippageTolerance
                            })];
                    case 1:
                        instantTrade = _a.sent();
                        return [2 /*return*/, {
                                toAmount: instantTrade.to.tokenAmount,
                                instantTrade: instantTrade
                            }];
                    case 2: return [2 /*return*/, {
                            toAmount: from.tokenAmount,
                            token: from
                        }];
                }
            });
        });
    };
    CrossChainManager.prototype.getMinMaxAmountsErrors = function (fromTrade) {
        return __awaiter(this, void 0, void 0, function () {
            var fromTransitTokenAmount, _a, minTransitTokenAmount, maxTransitTokenAmount, minAmount, maxAmount;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fromTransitTokenAmount = fromTrade.toAmount;
                        return [4 /*yield*/, this.getMinMaxTransitTokenAmounts(fromTrade)];
                    case 1:
                        _a = _b.sent(), minTransitTokenAmount = _a.minAmount, maxTransitTokenAmount = _a.maxAmount;
                        if (!fromTransitTokenAmount.lt(minTransitTokenAmount)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getTokenAmountForExactTransitTokenAmount(fromTrade, minTransitTokenAmount)];
                    case 2:
                        minAmount = _b.sent();
                        if (!(minAmount === null || minAmount === void 0 ? void 0 : minAmount.isFinite())) {
                            throw new insufficient_liquidity_error_1.InsufficientLiquidityError();
                        }
                        return [2 /*return*/, {
                                minAmount: minAmount
                            }];
                    case 3:
                        if (!fromTransitTokenAmount.gt(maxTransitTokenAmount)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.getTokenAmountForExactTransitTokenAmount(fromTrade, maxTransitTokenAmount)];
                    case 4:
                        maxAmount = _b.sent();
                        return [2 /*return*/, {
                                maxAmount: maxAmount
                            }];
                    case 5: return [2 /*return*/, {}];
                }
            });
        });
    };
    CrossChainManager.prototype.getMinMaxTransitTokenAmounts = function (fromTrade) {
        return __awaiter(this, void 0, void 0, function () {
            var fromTransitToken, getAmount;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fromTrade.contract.getTransitToken()];
                    case 1:
                        fromTransitToken = _a.sent();
                        getAmount = function (type) { return __awaiter(_this, void 0, void 0, function () {
                            var fromTransitTokenAmountAbsolute, fromTransitTokenAmount;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, fromTrade.contract.getMinOrMaxTransitTokenAmount(type)];
                                    case 1:
                                        fromTransitTokenAmountAbsolute = _a.sent();
                                        fromTransitTokenAmount = web3_pure_1.Web3Pure.fromWei(fromTransitTokenAmountAbsolute, fromTransitToken.decimals);
                                        if (type === 'minAmount') {
                                            if (fromTrade instanceof ItContractTrade_1.ItContractTrade) {
                                                return [2 /*return*/, fromTransitTokenAmount.dividedBy(fromTrade.slippageTolerance)];
                                            }
                                            return [2 /*return*/, fromTransitTokenAmount];
                                        }
                                        return [2 /*return*/, fromTransitTokenAmount.minus(1)];
                                }
                            });
                        }); };
                        return [2 /*return*/, Promise.all([getAmount('minAmount'), getAmount('maxAmount')]).then(function (_a) {
                                var minAmount = _a[0], maxAmount = _a[1];
                                return ({
                                    minAmount: minAmount,
                                    maxAmount: maxAmount
                                });
                            })];
                }
            });
        });
    };
    CrossChainManager.prototype.getTokenAmountForExactTransitTokenAmount = function (fromTrade, transitTokenAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var transitToken, instantTrade;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fromTrade.contract.getTransitToken()];
                    case 1:
                        transitToken = _a.sent();
                        if ((0, blockchain_1.compareAddresses)(fromTrade.fromToken.address, transitToken.address) ||
                            transitTokenAmount.eq(0)) {
                            return [2 /*return*/, transitTokenAmount];
                        }
                        return [4 /*yield*/, fromTrade.contract.uniswapV2Provider.calculateExactOutput(fromTrade.fromToken, new price_token_amount_1.PriceTokenAmount(__assign(__assign({}, transitToken), { tokenAmount: transitTokenAmount, price: new bignumber_js_1.default(NaN) })), {
                                gasCalculation: 'disabled'
                            })];
                    case 2:
                        instantTrade = _a.sent();
                        return [2 /*return*/, instantTrade.from.tokenAmount];
                }
            });
        });
    };
    CrossChainManager.prototype.getCryptoFeeTokenAndGasData = function (fromTrade, toTrade) {
        return __awaiter(this, void 0, void 0, function () {
            var cryptoFeeToken, gasData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fromTrade.contract.getCryptoFeeToken(toTrade.contract)];
                    case 1:
                        cryptoFeeToken = _a.sent();
                        return [4 /*yield*/, cross_chain_trade_1.CrossChainTrade.getGasData(fromTrade, toTrade, cryptoFeeToken)];
                    case 2:
                        gasData = _a.sent();
                        return [2 /*return*/, {
                                cryptoFeeToken: cryptoFeeToken,
                                gasData: gasData
                            }];
                }
            });
        });
    };
    return CrossChainManager;
}());
exports.CrossChainManager = CrossChainManager;
//# sourceMappingURL=cross-chain-manager.js.map