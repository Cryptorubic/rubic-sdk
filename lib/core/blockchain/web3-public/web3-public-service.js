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
exports.Web3PublicService = void 0;
var rubic_sdk_error_1 = require("../../../common/errors/rubic-sdk.error");
var web3_public_1 = require("./web3-public");
var p_timeout_1 = __importStar(require("p-timeout"));
var web3_1 = __importDefault(require("web3"));
var Web3PublicService = /** @class */ (function () {
    function Web3PublicService(rpcList) {
        this.rpcList = rpcList;
        this.web3PublicStorage = {};
    }
    Web3PublicService.createWeb3PublicService = function (rpcList) {
        return __awaiter(this, void 0, void 0, function () {
            var web3PublicService;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        web3PublicService = new Web3PublicService(rpcList);
                        return [4 /*yield*/, web3PublicService.createAndCheckWeb3Public()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, web3PublicService];
                }
            });
        });
    };
    Web3PublicService.prototype.getWeb3Public = function (blockchainName) {
        var web3Public = this.web3PublicStorage[blockchainName];
        if (!web3Public) {
            throw new rubic_sdk_error_1.RubicSdkError("Provider for ".concat(blockchainName, " was not initialized. Pass rpc link for this blockchain to sdk configuration object."));
        }
        return web3Public;
    };
    Web3PublicService.prototype.createAndCheckWeb3Public = function () {
        return __awaiter(this, void 0, void 0, function () {
            var promises, results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = Object.entries(this.rpcList).map(function (_a) {
                            var blockchainName = _a[0], rpcConfig = _a[1];
                            return __awaiter(_this, void 0, void 0, function () {
                                var web3Public, healthcheckResult;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            web3Public = this.createWeb3Public(rpcConfig, blockchainName);
                                            if (!rpcConfig.spareRpc) {
                                                return [2 /*return*/, web3Public];
                                            }
                                            return [4 /*yield*/, web3Public.healthCheck(rpcConfig.healthCheckTimeout || Web3PublicService.healthCheckDefaultTimeout)];
                                        case 1:
                                            healthcheckResult = _b.sent();
                                            if (healthcheckResult) {
                                                return [2 /*return*/, web3Public];
                                            }
                                            return [2 /*return*/, this.createWeb3Public({ mainRpc: rpcConfig.spareRpc }, blockchainName)];
                                    }
                                });
                            });
                        });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        results = _a.sent();
                        Object.keys(this.rpcList).forEach(function (blockchainName, index) {
                            return (_this.web3PublicStorage[blockchainName] = results[index]);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    Web3PublicService.prototype.createWeb3Public = function (rpcProvider, blockchainName) {
        var web3Public = new web3_public_1.Web3Public(new web3_1.default(rpcProvider.mainRpc), blockchainName);
        var nodeReplaced = false;
        return new Proxy(web3Public, {
            get: function (target, prop) {
                var _this = this;
                if (prop === 'setProvider' || prop === 'healthCheck') {
                    return target[prop].bind(target);
                }
                if (typeof target[prop] === 'function') {
                    return function () {
                        var params = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            params[_i] = arguments[_i];
                        }
                        return __awaiter(_this, void 0, void 0, function () {
                            var callMethod, e_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        callMethod = function () {
                                            var _a;
                                            return (_a = target[prop]).call.apply(_a, __spreadArray([target], params, false));
                                        };
                                        if (!(!nodeReplaced && rpcProvider.spareRpc)) return [3 /*break*/, 4];
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, (0, p_timeout_1.default)(callMethod(), rpcProvider.mainPrcTimeout ||
                                                Web3PublicService.mainRpcDefaultTimeout)];
                                    case 2: return [2 /*return*/, _a.sent()];
                                    case 3:
                                        e_1 = _a.sent();
                                        if (e_1 instanceof p_timeout_1.TimeoutError) {
                                            web3Public.setProvider(rpcProvider.spareRpc);
                                            nodeReplaced = true;
                                            return [2 /*return*/, callMethod()];
                                        }
                                        throw e_1;
                                    case 4: return [2 /*return*/, callMethod()];
                                }
                            });
                        });
                    };
                }
                return target[prop];
            }
        });
    };
    return Web3PublicService;
}());
exports.Web3PublicService = Web3PublicService;
//# sourceMappingURL=web3-public-service.js.map