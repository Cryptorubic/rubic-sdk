"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOneinchApiBaseUrl = void 0;
var blockchains_info_1 = require("@core/blockchain/blockchains-info");
var constants_1 = require("@features/swap/dexes/common/oneinch-common/constants");
function getOneinchApiBaseUrl(blockchain) {
    var blockchainId = blockchains_info_1.BlockchainsInfo.getBlockchainByName(blockchain).id;
    return constants_1.oneinchApiParams.apiBaseUrl + "/" + blockchainId;
}
exports.getOneinchApiBaseUrl = getOneinchApiBaseUrl;
//# sourceMappingURL=utils.js.map