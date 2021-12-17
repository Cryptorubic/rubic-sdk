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
exports.SUPPORTING_FEE_SWAP_METHODS_MAPPING = exports.SWAP_METHOD = exports.EXACT_OUTPUT_SWAP_METHOD = exports.EXACT_OUTPUT_SUPPORTING_FEE_SWAP_METHOD = exports.EXACT_OUTPUT_REGULAR_SWAP_METHOD = exports.EXACT_INPUT_SWAP_METHOD = exports.EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD = exports.EXACT_INPUT_REGULAR_SWAP_METHOD = void 0;
exports.EXACT_INPUT_REGULAR_SWAP_METHOD = {
    TOKENS_TO_TOKENS: 'swapExactTokensForTokens',
    ETH_TO_TOKENS: 'swapExactETHForTokens',
    TOKENS_TO_ETH: 'swapExactTokensForETH'
};
exports.EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD = {
    TOKENS_TO_TOKENS_SUPPORTING_FEE: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
    ETH_TO_TOKENS_SUPPORTING_FEE: 'swapExactETHForTokensSupportingFeeOnTransferTokens',
    TOKENS_TO_ETH_SUPPORTING_FEE: 'swapExactTokensForETHSupportingFeeOnTransferTokens'
};
exports.EXACT_INPUT_SWAP_METHOD = __assign(__assign({}, exports.EXACT_INPUT_REGULAR_SWAP_METHOD), exports.EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD);
exports.EXACT_OUTPUT_REGULAR_SWAP_METHOD = {
    TOKENS_TO_TOKENS: 'swapTokensForExactTokens',
    ETH_TO_TOKENS: 'swapETHForExactTokens',
    TOKENS_TO_ETH: 'swapTokensForExactETH'
};
exports.EXACT_OUTPUT_SUPPORTING_FEE_SWAP_METHOD = {
    TOKENS_TO_TOKENS_SUPPORTING_FEE: 'swapTokensForExactTokensSupportingFeeOnTransferTokens',
    ETH_TO_TOKENS_SUPPORTING_FEE: 'swapETHForExactTokensSupportingFeeOnTransferTokens',
    TOKENS_TO_ETH_SUPPORTING_FEE: 'swapTokensForExactETHSupportingFeeOnTransferTokens'
};
exports.EXACT_OUTPUT_SWAP_METHOD = __assign(__assign({}, exports.EXACT_OUTPUT_REGULAR_SWAP_METHOD), exports.EXACT_OUTPUT_SUPPORTING_FEE_SWAP_METHOD);
exports.SWAP_METHOD = {
    input: exports.EXACT_INPUT_SWAP_METHOD,
    output: exports.EXACT_OUTPUT_SWAP_METHOD
};
exports.SUPPORTING_FEE_SWAP_METHODS_MAPPING = {
    TOKENS_TO_TOKENS: 'TOKENS_TO_TOKENS_SUPPORTING_FEE',
    ETH_TO_TOKENS: 'ETH_TO_TOKENS_SUPPORTING_FEE',
    TOKENS_TO_ETH: 'TOKENS_TO_ETH_SUPPORTING_FEE'
};
//# sourceMappingURL=SWAP_METHOD.js.map