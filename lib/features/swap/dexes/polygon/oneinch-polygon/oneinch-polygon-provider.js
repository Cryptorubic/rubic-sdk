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
exports.OneinchPolygonProvider = void 0;
var oneinch_abstract_provider_1 = require("../../common/oneinch-common/oneinch-abstract-provider");
var BLOCKCHAIN_NAME_1 = require("../../../../../core/blockchain/models/BLOCKCHAIN_NAME");
var features_1 = require("../../../..");
var OneinchPolygonProvider = /** @class */ (function (_super) {
    __extends(OneinchPolygonProvider, _super);
    function OneinchPolygonProvider() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.blockchain = BLOCKCHAIN_NAME_1.BLOCKCHAIN_NAME.POLYGON;
        return _this;
    }
    Object.defineProperty(OneinchPolygonProvider.prototype, "type", {
        get: function () {
            return features_1.TRADE_TYPE.ONE_INCH_POLYGON;
        },
        enumerable: false,
        configurable: true
    });
    return OneinchPolygonProvider;
}(oneinch_abstract_provider_1.OneinchAbstractProvider));
exports.OneinchPolygonProvider = OneinchPolygonProvider;
//# sourceMappingURL=oneinch-polygon-provider.js.map