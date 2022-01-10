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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstantTrade = void 0;
var rubic_sdk_error_1 = require("../../common/errors/rubic-sdk.error");
var wallet_not_connected_error_1 = require("../../common/errors/swap/wallet-not-connected.error");
var wrong_network_error_1 = require("../../common/errors/swap/wrong-network.error");
var price_token_amount_1 = require("../../core/blockchain/tokens/price-token-amount");
var injector_1 = require("../../core/sdk/injector");
var InstantTrade = /** @class */ (function () {
    function InstantTrade(blockchain) {
        this.web3Public = injector_1.Injector.web3PublicService.getWeb3Public(blockchain);
    }
    Object.defineProperty(InstantTrade.prototype, "toTokenAmountMin", {
        get: function () {
            var weiAmountOutMin = this.to.weiAmountMinusSlippage(this.slippageTolerance);
            return new price_token_amount_1.PriceTokenAmount(__assign(__assign({}, this.to.asStruct), { weiAmount: weiAmountOutMin }));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InstantTrade.prototype, "walletAddress", {
        get: function () {
            return injector_1.Injector.web3Private.address;
        },
        enumerable: false,
        configurable: true
    });
    InstantTrade.prototype.needApprove = function () {
        return __awaiter(this, void 0, void 0, function () {
            var allowance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.checkWalletConnected();
                        if (this.from.isNative) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.web3Public.getAllowance(this.from.address, this.walletAddress, this.contractAddress)];
                    case 1:
                        allowance = _a.sent();
                        return [2 /*return*/, allowance.lt(this.from.weiAmount)];
                }
            });
        });
    };
    InstantTrade.prototype.approve = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var needApprove;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.needApprove()];
                    case 1:
                        needApprove = _a.sent();
                        if (!needApprove) {
                            throw new rubic_sdk_error_1.RubicSdkError('You should check allowance via `needApprove` method before calling `approve`. Current allowance is enough for swap.');
                        }
                        this.checkWalletConnected();
                        this.checkBlockchainCorrect();
                        return [2 /*return*/, injector_1.Injector.web3Private.approveTokens(this.from.address, this.contractAddress, 'infinity', __assign(__assign({}, options), { gas: options === null || options === void 0 ? void 0 : options.gasLimit }))];
                }
            });
        });
    };
    InstantTrade.prototype.checkAllowanceAndApprove = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var needApprove, txOptions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.needApprove()];
                    case 1:
                        needApprove = _a.sent();
                        if (!needApprove) {
                            return [2 /*return*/];
                        }
                        txOptions = {
                            onTransactionHash: options === null || options === void 0 ? void 0 : options.onApprove,
                            gas: (options === null || options === void 0 ? void 0 : options.gasLimit) || undefined,
                            gasPrice: (options === null || options === void 0 ? void 0 : options.gasPrice) || undefined
                        };
                        return [4 /*yield*/, injector_1.Injector.web3Private.approveTokens(this.from.address, this.contractAddress, 'infinity', txOptions)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    InstantTrade.prototype.checkWalletState = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.checkWalletConnected();
                        this.checkBlockchainCorrect();
                        return [4 /*yield*/, this.web3Public.checkBalance(this.from, this.from.tokenAmount, this.walletAddress)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    InstantTrade.prototype.checkWalletConnected = function () {
        if (!this.walletAddress) {
            throw new wallet_not_connected_error_1.WalletNotConnectedError();
        }
    };
    InstantTrade.prototype.checkBlockchainCorrect = function () {
        if (injector_1.Injector.web3Private.blockchainName !== this.from.blockchain) {
            throw new wrong_network_error_1.WrongNetworkError();
        }
    };
    InstantTrade.prototype.getGasLimit = function (options) {
        var _a, _b;
        if (options === null || options === void 0 ? void 0 : options.gasLimit) {
            return options.gasLimit;
        }
        if ((_b = (_a = this.gasFeeInfo) === null || _a === void 0 ? void 0 : _a.gasLimit) === null || _b === void 0 ? void 0 : _b.isFinite()) {
            return this.gasFeeInfo.gasLimit.toFixed(0);
        }
        return undefined;
    };
    InstantTrade.prototype.getGasPrice = function (options) {
        var _a, _b;
        if (options === null || options === void 0 ? void 0 : options.gasPrice) {
            return options.gasPrice;
        }
        if ((_b = (_a = this.gasFeeInfo) === null || _a === void 0 ? void 0 : _a.gasPrice) === null || _b === void 0 ? void 0 : _b.isFinite()) {
            return this.gasFeeInfo.gasPrice.toFixed(0);
        }
        return undefined;
    };
    InstantTrade.prototype.getGasParams = function (options) {
        var gas = this.getGasLimit({
            gasLimit: options.gasLimit
        });
        var gasPrice = this.getGasPrice({
            gasPrice: options.gasPrice
        });
        return { gas: gas, gasPrice: gasPrice };
    };
    return InstantTrade;
}());
exports.InstantTrade = InstantTrade;
//# sourceMappingURL=instant-trade.js.map