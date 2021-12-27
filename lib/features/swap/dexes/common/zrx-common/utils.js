"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getZrxApiBaseUrl = void 0;
var constants_1 = require("./constants");
var rubic_sdk_error_1 = require("../../../../../common/errors/rubic-sdk.error");
function getZrxApiBaseUrl(blockchain) {
    var apiBaseUrl = constants_1.zrxApiParams.apiBaseUrl;
    if (!Object.keys(apiBaseUrl).includes(blockchain)) {
        throw new rubic_sdk_error_1.RubicSdkError("Zrx doesn't support ".concat(blockchain, " blockchain"));
    }
    return apiBaseUrl[blockchain];
}
exports.getZrxApiBaseUrl = getZrxApiBaseUrl;
//# sourceMappingURL=utils.js.map