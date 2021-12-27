"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pure = void 0;
var rubic_sdk_error_1 = require("../errors/rubic-sdk.error");
function Pure(_target, propertyKey, _a) {
    var get = _a.get, enumerable = _a.enumerable;
    if (!get) {
        throw new rubic_sdk_error_1.RubicSdkError('Pure can only be used with getters');
    }
    return {
        enumerable: enumerable,
        get: function () {
            var value = get.call(this);
            Object.defineProperty(this, propertyKey, { enumerable: enumerable, value: value });
            return value;
        }
    };
}
exports.Pure = Pure;
//# sourceMappingURL=pure.decorator.js.map