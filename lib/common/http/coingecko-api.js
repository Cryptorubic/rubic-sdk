"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.CoingeckoApi = void 0;
var BLOCKCHAIN_NAME_1 = require("../../core/blockchain/models/BLOCKCHAIN_NAME");
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var p_timeout_1 = __importStar(require("p-timeout"));
var common_1 = require("..");
var rubic_sdk_error_1 = require("../errors/rubic-sdk.error");
var web3_pure_1 = require("../../core/blockchain/web3-pure/web3-pure");
var supportedBlockchains = [
    BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.HARMONY,
    BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.MOONRIVER,
    BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.FANTOM
];
var API_BASE_URL = 'https://api.coingecko.com/api/v3/';
var CoingeckoApi = /** @class */ (function () {
    function CoingeckoApi(httpClient) {
        var _a, _b;
        this.httpClient = httpClient;
        this.nativeCoinsCoingeckoIds = (_a = {},
            _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.ETHEREUM] = 'ethereum',
            _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN] = 'binancecoin',
            _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.POLYGON] = 'matic-network',
            _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.HARMONY] = 'harmony',
            _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.AVALANCHE] = 'avalanche-2',
            _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.MOONRIVER] = 'moonriver',
            _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.FANTOM] = 'fantom',
            _a);
        this.tokenBlockchainId = (_b = {},
            _b[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.ETHEREUM] = 'ethereum',
            _b[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN] = 'binance-smart-chain',
            _b[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.POLYGON] = 'polygon-pos',
            _b[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.HARMONY] = 'harmony-shard-0',
            _b[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.AVALANCHE] = 'avalanche',
            _b[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.MOONRIVER] = 'moonriver',
            _b[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.FANTOM] = 'fantom',
            _b);
    }
    CoingeckoApi.isSupportedBlockchain = function (blockchain) {
        return supportedBlockchains.some(function (supportedBlockchain) { return supportedBlockchain === blockchain; });
    };
    /**
     * Gets price of native coin in usd from coingecko.
     * @param blockchain Supported by {@link supportedBlockchains} blockchain.
     */
    CoingeckoApi.prototype.getNativeCoinPrice = function (blockchain) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var coingeckoId, response, err_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!CoingeckoApi.isSupportedBlockchain(blockchain)) {
                            throw new rubic_sdk_error_1.RubicSdkError("Blockchain ".concat(blockchain, " is not supported by coingecko-api"));
                        }
                        coingeckoId = this.nativeCoinsCoingeckoIds[blockchain];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, p_timeout_1.default)(this.httpClient.get("".concat(API_BASE_URL, "simple/price"), {
                                params: { ids: coingeckoId, vs_currencies: 'usd' }
                            }), 3000)];
                    case 2:
                        response = _c.sent();
                        return [2 /*return*/, new bignumber_js_1.default(response[coingeckoId].usd)];
                    case 3:
                        err_1 = _c.sent();
                        if (err_1 instanceof p_timeout_1.TimeoutError) {
                            console.debug('[RUBIC SDK]: Timeout Error. Coingecko cannot retrieve token price');
                        }
                        else if ((_b = (_a = err_1) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.includes('Request failed with status code 429')) {
                            console.debug('[RUBIC SDK]: Too many requests. Coingecko cannot retrieve token price');
                        }
                        else {
                            console.debug(err_1);
                        }
                        return [2 /*return*/, new bignumber_js_1.default(NaN)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets price of token in usd from coingecko.
     * @param token Token to get price for.
     */
    CoingeckoApi.prototype.getErc20TokenPrice = function (token) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var blockchain, blockchainId, response, err_2;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        blockchain = token.blockchain;
                        if (!CoingeckoApi.isSupportedBlockchain(blockchain)) {
                            throw new rubic_sdk_error_1.RubicSdkError("Blockchain ".concat(blockchain, " is not supported by coingecko-api"));
                        }
                        blockchainId = this.tokenBlockchainId[blockchain];
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, p_timeout_1.default)(this.httpClient.get("".concat(API_BASE_URL, "coins/").concat(blockchainId, "/contract/").concat(token.address.toLowerCase())), 3000)];
                    case 2:
                        response = _e.sent();
                        return [2 /*return*/, new bignumber_js_1.default(((_b = (_a = response === null || response === void 0 ? void 0 : response.market_data) === null || _a === void 0 ? void 0 : _a.current_price) === null || _b === void 0 ? void 0 : _b.usd) || NaN)];
                    case 3:
                        err_2 = _e.sent();
                        if (err_2 instanceof p_timeout_1.TimeoutError) {
                            console.debug('[RUBIC SDK]: Timeout Error. Coingecko cannot retrieve token price');
                        }
                        else if ((_d = (_c = err_2) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.includes('Request failed with status code 429')) {
                            console.debug('[RUBIC SDK]: Too many requests. Coingecko cannot retrieve token price');
                        }
                        else {
                            console.debug(err_2);
                        }
                        return [2 /*return*/, new bignumber_js_1.default(NaN)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets price of common token or native coin in usd from coingecko.
     * @param token Token to get price for.
     */
    CoingeckoApi.prototype.getTokenPrice = function (token) {
        if (web3_pure_1.Web3Pure.isNativeAddress(token.address)) {
            return this.getNativeCoinPrice(token.blockchain);
        }
        return this.getErc20TokenPrice(token);
    };
    __decorate([
        (0, common_1.Cache)({
            maxAge: 15000
        })
    ], CoingeckoApi.prototype, "getNativeCoinPrice", null);
    __decorate([
        (0, common_1.Cache)({
            maxAge: 15000
        })
    ], CoingeckoApi.prototype, "getErc20TokenPrice", null);
    return CoingeckoApi;
}());
exports.CoingeckoApi = CoingeckoApi;
//# sourceMappingURL=coingecko-api.js.map