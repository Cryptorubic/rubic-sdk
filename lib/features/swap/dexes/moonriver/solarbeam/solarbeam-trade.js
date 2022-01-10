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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolarbeamTrade = void 0;
var injector_1 = require("../../../../../core/sdk/injector");
var uniswap_v2_abstract_trade_1 = require("../../common/uniswap-v2-abstract/uniswap-v2-abstract-trade");
var constants_1 = require("./constants");
var features_1 = require("../../../..");
var SolarbeamTrade = /** @class */ (function (_super) {
    __extends(SolarbeamTrade, _super);
    function SolarbeamTrade(tradeStruct) {
        var _this = _super.call(this, tradeStruct) || this;
        _this.contractAddress = constants_1.SOLARBEAM_CONTRACT_ADDRESS;
        return _this;
    }
    Object.defineProperty(SolarbeamTrade, "type", {
        get: function () {
            return features_1.TRADE_TYPE.SOLAR_BEAM;
        },
        enumerable: false,
        configurable: true
    });
    SolarbeamTrade.callForRoutes = function (blockchain, exact, routesMethodArguments) {
        var _this = this;
        var web3Public = injector_1.Injector.web3PublicService.getWeb3Public(blockchain);
        return web3Public.multicallContractMethod(this.getContractAddress(blockchain), this.contractAbi, exact === 'input' ? 'getAmountsOut' : 'getAmountsIn', routesMethodArguments.map(function (args) { return args.concat(_this.feeParameter); }));
    };
    SolarbeamTrade.contractAbi = constants_1.SOLARBEAM_CONTRACT_ABI;
    SolarbeamTrade.feeParameter = '25';
    return SolarbeamTrade;
}(uniswap_v2_abstract_trade_1.UniswapV2AbstractTrade));
exports.SolarbeamTrade = SolarbeamTrade;
//# sourceMappingURL=solarbeam-trade.js.map