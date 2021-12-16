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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AVALANCHE_SWAP_METHOD = exports.AVALANCHE_EXACT_OUTPUT_SWAP_METHOD = exports.AVALANCHE_EXACT_OUTPUT_SUPPORTING_FEE_SWAP_METHOD = exports.AVALANCHE_EXACT_OUTPUT_REGULAR_SWAP_METHOD = exports.AVALANCHE_EXACT_INPUT_SWAP_METHOD = exports.AVALANCHE_EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD = exports.AVALANCHE_EXACT_INPUT_REGULAR_SWAP_METHOD = void 0;
exports.AVALANCHE_EXACT_INPUT_REGULAR_SWAP_METHOD = {
    TOKENS_TO_TOKENS: 'swapExactTokensForTokens',
    ETH_TO_TOKENS: 'swapExactAVAXForTokens',
    TOKENS_TO_ETH: 'swapExactTokensForAVAX'
};
exports.AVALANCHE_EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD = {
    TOKENS_TO_TOKENS_SUPPORTING_FEE: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
    ETH_TO_TOKENS_SUPPORTING_FEE: 'swapExactAVAXForTokensSupportingFeeOnTransferTokens',
    TOKENS_TO_ETH_SUPPORTING_FEE: 'swapExactTokensForAVAXSupportingFeeOnTransferTokens'
};
exports.AVALANCHE_EXACT_INPUT_SWAP_METHOD = __assign(__assign({}, exports.AVALANCHE_EXACT_INPUT_REGULAR_SWAP_METHOD), exports.AVALANCHE_EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD);
exports.AVALANCHE_EXACT_OUTPUT_REGULAR_SWAP_METHOD = {
    TOKENS_TO_TOKENS: 'swapTokensForExactTokens',
    ETH_TO_TOKENS: 'swapAVAXForExactTokens',
    TOKENS_TO_ETH: 'swapTokensForExactAVAX'
};
exports.AVALANCHE_EXACT_OUTPUT_SUPPORTING_FEE_SWAP_METHOD = {
    TOKENS_TO_TOKENS_SUPPORTING_FEE: 'swapTokensForExactTokensSupportingFeeOnTransferTokens',
    ETH_TO_TOKENS_SUPPORTING_FEE: 'swapAVAXForExactTokensSupportingFeeOnTransferTokens',
    TOKENS_TO_ETH_SUPPORTING_FEE: 'swapTokensForExactAVAXSupportingFeeOnTransferTokens'
};
exports.AVALANCHE_EXACT_OUTPUT_SWAP_METHOD = __assign(__assign({}, exports.AVALANCHE_EXACT_OUTPUT_REGULAR_SWAP_METHOD), exports.AVALANCHE_EXACT_OUTPUT_SUPPORTING_FEE_SWAP_METHOD);
exports.AVALANCHE_SWAP_METHOD = {
    input: exports.AVALANCHE_EXACT_INPUT_SWAP_METHOD,
    output: exports.AVALANCHE_EXACT_OUTPUT_SWAP_METHOD
};
//# sourceMappingURL=swap-methods.js.map