"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokensManager = void 0;
var price_token_1 = require("../../core/blockchain/tokens/price-token");
var price_token_amount_1 = require("../../core/blockchain/tokens/price-token-amount");
var token_1 = require("../../core/blockchain/tokens/token");
var TokensManager = /** @class */ (function () {
    function TokensManager() {
    }
    TokensManager.prototype.createTokenFromStruct = function (tokenStruct) {
        return new token_1.Token(tokenStruct);
    };
    TokensManager.prototype.createToken = function (tokenBaseStruct) {
        return token_1.Token.createToken(tokenBaseStruct);
    };
    TokensManager.prototype.createTokensFromStructs = function (tokensStructs) {
        var _this = this;
        return tokensStructs.map(function (tokenStruct) { return _this.createTokenFromStruct(tokenStruct); });
    };
    TokensManager.prototype.createTokens = function (addresses, blockchain) {
        return token_1.Token.createTokens(addresses, blockchain);
    };
    TokensManager.prototype.createPriceTokenFromStruct = function (priceTokenStruct) {
        return new price_token_1.PriceToken(priceTokenStruct);
    };
    TokensManager.prototype.createPriceToken = function (token) {
        if ('name' in token && 'symbol' in token && 'decimals' in token) {
            return price_token_1.PriceToken.createFromToken(token);
        }
        return price_token_1.PriceToken.createToken(token);
    };
    TokensManager.prototype.createPriceTokenAmountFromStruct = function (priceTokenAmountStruct) {
        return new price_token_amount_1.PriceTokenAmount(priceTokenAmountStruct);
    };
    TokensManager.prototype.createPriceTokenAmount = function (priceTokenAmountStruct) {
        if ('name' in priceTokenAmountStruct &&
            'symbol' in priceTokenAmountStruct &&
            'decimals' in priceTokenAmountStruct) {
            return price_token_amount_1.PriceTokenAmount.createFromToken(priceTokenAmountStruct);
        }
        return price_token_amount_1.PriceTokenAmount.createToken(priceTokenAmountStruct);
    };
    return TokensManager;
}());
exports.TokensManager = TokensManager;
//# sourceMappingURL=tokens-manager.js.map