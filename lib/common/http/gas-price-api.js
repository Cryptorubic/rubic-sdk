"use strict";
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
exports.GasPriceApi = void 0;
var BLOCKCHAIN_NAME_1 = require("../../core/blockchain/models/BLOCKCHAIN_NAME");
var injector_1 = require("../../core/sdk/injector");
var common_1 = require("..");
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var p_timeout_1 = __importDefault(require("p-timeout"));
var rubic_sdk_error_1 = require("../errors/rubic-sdk.error");
var web3_pure_1 = require("../../core/blockchain/web3-pure/web3-pure");
var supportedBlockchains = [BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.ETHEREUM, BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.AVALANCHE];
var GasPriceApi = /** @class */ (function () {
    function GasPriceApi(httpClient) {
        var _a;
        this.httpClient = httpClient;
        this.gasPriceFunctions = (_a = {},
            _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.ETHEREUM] = this.fetchEthGas.bind(this),
            _a[BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.AVALANCHE] = this.fetchAvalancheGas.bind(this),
            _a);
    }
    GasPriceApi.isSupportedBlockchain = function (blockchain) {
        return supportedBlockchains.some(function (supBlockchain) { return supBlockchain === blockchain; });
    };
    /**
     * Gas price in Wei for selected blockchain.
     * @param blockchain Blockchain to get gas price from.
     * @return Promise<BigNumber> Average gas price in Wei.
     */
    GasPriceApi.prototype.getGasPrice = function (blockchain) {
        if (!GasPriceApi.isSupportedBlockchain(blockchain)) {
            throw new rubic_sdk_error_1.RubicSdkError("Blockchain ".concat(blockchain, " is not supported by gas-price-api"));
        }
        return this.gasPriceFunctions[blockchain]();
    };
    /**
     * Gas price in Eth units for selected blockchain.
     * @param blockchain Blockchain to get gas price from.
     * @return Promise<BigNumber> Average gas price in Eth units.
     */
    GasPriceApi.prototype.getGasPriceInEthUnits = function (blockchain) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = web3_pure_1.Web3Pure).fromWei;
                        return [4 /*yield*/, this.getGasPrice(blockchain)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    /**
     * Gets Ethereum gas price from different APIs, sorted by priority.
     * @return Promise<BigNumber> Average gas price in Wei.
     */
    GasPriceApi.prototype.fetchEthGas = function () {
        return __awaiter(this, void 0, void 0, function () {
            var requestTimeout, response, _err_1, response, _err_2, web3Public;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requestTimeout = 3000;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, p_timeout_1.default)(this.httpClient.get('https://gas-price-api.1inch.io/v1.2/1'), requestTimeout)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.medium.maxFeePerGas];
                    case 3:
                        _err_1 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, (0, p_timeout_1.default)(this.httpClient.get('https://ethgasstation.info/api/ethgasAPI.json'), requestTimeout)];
                    case 5:
                        response = _a.sent();
                        return [2 /*return*/, new bignumber_js_1.default(response.average / 10).multipliedBy(Math.pow(10, 9)).toFixed(0)];
                    case 6:
                        _err_2 = _a.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        web3Public = injector_1.Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.ETHEREUM);
                        return [2 /*return*/, web3Public.getGasPrice()];
                }
            });
        });
    };
    /**
     * Gets Avalanche gas price.
     * @return Promise<BigNumber> Average gas price in Wei.
     */
    GasPriceApi.prototype.fetchAvalancheGas = function () {
        var web3Public = injector_1.Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.AVALANCHE);
        return web3Public.getGasPrice();
    };
    /**
     * Gas price request interval in seconds.
     */
    GasPriceApi.requestInterval = 15000;
    __decorate([
        (0, common_1.Cache)({
            maxAge: GasPriceApi.requestInterval
        })
    ], GasPriceApi.prototype, "fetchEthGas", null);
    __decorate([
        (0, common_1.Cache)({
            maxAge: GasPriceApi.requestInterval
        })
    ], GasPriceApi.prototype, "fetchAvalancheGas", null);
    return GasPriceApi;
}());
exports.GasPriceApi = GasPriceApi;
//# sourceMappingURL=gas-price-api.js.map