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
exports.PriceTokenAmount = void 0;
var price_token_1 = require("./price-token");
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var web3_pure_1 = require("../web3-pure/web3-pure");
var PriceTokenAmount = /** @class */ (function (_super) {
    __extends(PriceTokenAmount, _super);
    function PriceTokenAmount(tokenStruct) {
        var _this = _super.call(this, tokenStruct) || this;
        if ('weiAmount' in tokenStruct) {
            _this._weiAmount = new bignumber_js_1.default(tokenStruct.weiAmount);
        }
        else {
            _this._weiAmount = new bignumber_js_1.default(web3_pure_1.Web3Pure.toWei(tokenStruct.tokenAmount, tokenStruct.decimals));
        }
        return _this;
    }
    PriceTokenAmount.createToken = function (tokenAmountBaseStruct) {
        return __awaiter(this, void 0, void 0, function () {
            var token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.createToken.call(this, tokenAmountBaseStruct)];
                    case 1:
                        token = _a.sent();
                        return [2 /*return*/, new PriceTokenAmount(__assign(__assign({}, tokenAmountBaseStruct), token.asStruct))];
                }
            });
        });
    };
    PriceTokenAmount.createFromToken = function (tokenAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var priceToken;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.createFromToken.call(this, tokenAmount)];
                    case 1:
                        priceToken = _a.sent();
                        return [2 /*return*/, new PriceTokenAmount(__assign(__assign({}, tokenAmount), { price: priceToken.price }))];
                }
            });
        });
    };
    Object.defineProperty(PriceTokenAmount.prototype, "weiAmount", {
        get: function () {
            return new bignumber_js_1.default(this._weiAmount);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PriceTokenAmount.prototype, "stringWeiAmount", {
        get: function () {
            return this._weiAmount.toFixed(0);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PriceTokenAmount.prototype, "tokenAmount", {
        get: function () {
            return new bignumber_js_1.default(this._weiAmount).div(new bignumber_js_1.default(10).pow(this.decimals));
        },
        enumerable: false,
        configurable: true
    });
    PriceTokenAmount.prototype.weiAmountMinusSlippage = function (slippage) {
        return new bignumber_js_1.default(this._weiAmount).multipliedBy(new bignumber_js_1.default(1).minus(slippage));
    };
    PriceTokenAmount.prototype.weiAmountPlusSlippage = function (slippage) {
        return new bignumber_js_1.default(this._weiAmount).multipliedBy(new bignumber_js_1.default(1).plus(slippage));
    };
    PriceTokenAmount.prototype.cloneAndCreate = function (tokenStruct) {
        return __awaiter(this, void 0, void 0, function () {
            var priceToken;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, price_token_1.PriceToken.prototype.cloneAndCreate.call(this, tokenStruct)];
                    case 1:
                        priceToken = _a.sent();
                        return [2 /*return*/, new PriceTokenAmount(__assign(__assign(__assign({}, priceToken.asStruct), { weiAmount: this.weiAmount }), tokenStruct))];
                }
            });
        });
    };
    PriceTokenAmount.prototype.clone = function (tokenStruct) {
        return new PriceTokenAmount(__assign(__assign({}, this), tokenStruct));
    };
    PriceTokenAmount.prototype.calculatePriceImpactPercent = function (toToken) {
        var _a, _b;
        if (!this.price ||
            !toToken.price ||
            !((_a = this.tokenAmount) === null || _a === void 0 ? void 0 : _a.isFinite()) ||
            !((_b = toToken.tokenAmount) === null || _b === void 0 ? void 0 : _b.isFinite())) {
            return null;
        }
        var fromTokenCost = this.tokenAmount.multipliedBy(this.price);
        var toTokenCost = toToken.tokenAmount.multipliedBy(toToken.price);
        var impact = fromTokenCost
            .minus(toTokenCost)
            .dividedBy(fromTokenCost)
            .multipliedBy(100)
            .dp(2, bignumber_js_1.default.ROUND_HALF_UP)
            .toNumber();
        return impact > 0 ? impact : 0;
    };
    return PriceTokenAmount;
}(price_token_1.PriceToken));
exports.PriceTokenAmount = PriceTokenAmount;
//# sourceMappingURL=price-token-amount.js.map