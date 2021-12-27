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
exports.Token = void 0;
var rubic_sdk_error_1 = require("../../../common/errors/rubic-sdk.error");
var web3_pure_1 = require("../web3-pure/web3-pure");
var injector_1 = require("../../sdk/injector");
var blockchain_1 = require("../../../common/utils/blockchain");
var Token = /** @class */ (function () {
    function Token(tokenStruct) {
        this.blockchain = tokenStruct.blockchain;
        this.address = tokenStruct.address;
        this.name = tokenStruct.name;
        this.symbol = tokenStruct.symbol;
        this.decimals = tokenStruct.decimals;
    }
    Token.createToken = function (tokenBaseStruct) {
        return __awaiter(this, void 0, void 0, function () {
            var web3Public, tokenInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        web3Public = injector_1.Injector.web3PublicService.getWeb3Public(tokenBaseStruct.blockchain);
                        return [4 /*yield*/, web3Public.callForTokenInfo(tokenBaseStruct.address)];
                    case 1:
                        tokenInfo = _a.sent();
                        if (tokenInfo.decimals == null || tokenInfo.name == null || tokenInfo.symbol == null) {
                            throw new rubic_sdk_error_1.RubicSdkError('Error while loading token');
                        }
                        return [2 /*return*/, new Token(__assign(__assign({}, tokenBaseStruct), { name: tokenInfo.name, symbol: tokenInfo.symbol, decimals: parseInt(tokenInfo.decimals) }))];
                }
            });
        });
    };
    Token.createTokens = function (tokensAddresses, blockchain) {
        return __awaiter(this, void 0, void 0, function () {
            var web3Public, tokenInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        web3Public = injector_1.Injector.web3PublicService.getWeb3Public(blockchain);
                        return [4 /*yield*/, web3Public.callForTokensInfo(tokensAddresses)];
                    case 1:
                        tokenInfo = _a.sent();
                        return [2 /*return*/, tokenInfo.map(function (tokenInfo, index) {
                                if (tokenInfo.decimals === undefined ||
                                    tokenInfo.name === undefined ||
                                    tokenInfo.symbol === undefined) {
                                    throw new rubic_sdk_error_1.RubicSdkError('Error while loading token');
                                }
                                return new Token({
                                    address: tokensAddresses[index],
                                    blockchain: blockchain,
                                    name: tokenInfo.name,
                                    symbol: tokenInfo.symbol,
                                    decimals: parseInt(tokenInfo.decimals)
                                });
                            })];
                }
            });
        });
    };
    Token.tokensToAddresses = function (tokens) {
        return tokens.map(function (token) { return token.address; });
    };
    Object.defineProperty(Token.prototype, "isNative", {
        get: function () {
            return web3_pure_1.Web3Pure.isNativeAddress(this.address);
        },
        enumerable: false,
        configurable: true
    });
    Token.prototype.isEqualTo = function (token) {
        return (token.blockchain === this.blockchain && (0, blockchain_1.compareAddresses)(token.address, this.address));
    };
    Token.prototype.clone = function (tokenStruct) {
        return new Token(__assign(__assign({}, this), tokenStruct));
    };
    return Token;
}());
exports.Token = Token;
//# sourceMappingURL=token.js.map