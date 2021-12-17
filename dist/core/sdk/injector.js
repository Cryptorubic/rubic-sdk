"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Injector = void 0;
var coingecko_api_1 = require("../../common/http/coingecko-api");
var gas_price_api_1 = require("../../common/http/gas-price-api");
var Injector = /** @class */ (function () {
    function Injector(web3PublicService, web3Private, httpClient) {
        this.web3PublicService = web3PublicService;
        this.web3Private = web3Private;
        this.httpClient = httpClient;
        this.coingeckoApi = new coingecko_api_1.CoingeckoApi(httpClient);
        this.gasPriceApi = new gas_price_api_1.GasPriceApi(httpClient);
        Injector.injector = this;
    }
    Object.defineProperty(Injector, "web3PublicService", {
        get: function () {
            return Injector.injector.web3PublicService;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Injector, "web3Private", {
        get: function () {
            return Injector.injector.web3Private;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Injector, "httpClient", {
        get: function () {
            return Injector.injector.httpClient;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Injector, "coingeckoApi", {
        get: function () {
            return Injector.injector.coingeckoApi;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Injector, "gasPriceApi", {
        get: function () {
            return Injector.injector.gasPriceApi;
        },
        enumerable: false,
        configurable: true
    });
    Injector.createInjector = function (web3PublicService, web3Private, httpClient) {
        // eslint-disable-next-line no-new
        new Injector(web3PublicService, web3Private, httpClient);
    };
    return Injector;
}());
exports.Injector = Injector;
//# sourceMappingURL=injector.js.map