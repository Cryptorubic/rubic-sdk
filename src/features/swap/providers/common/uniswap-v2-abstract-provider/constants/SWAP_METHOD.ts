export type RegularSwapMethod = 'TOKENS_TO_TOKENS' | 'ETH_TO_TOKENS' | 'TOKENS_TO_ETH';
export type SupportingFeeSwapMethod =
    | 'TOKENS_TO_TOKENS_SUPPORTING_FEE'
    | 'ETH_TO_TOKENS_SUPPORTING_FEE'
    | 'TOKENS_TO_ETH_SUPPORTING_FEE';

export type RegularSwapMethodsList = Record<RegularSwapMethod, string>;
export type SupportingFeeSwapMethodsList = Record<SupportingFeeSwapMethod, string>;
export type SwapMethodsList = RegularSwapMethodsList & SupportingFeeSwapMethodsList;
export type ExactInputOutputSwapMethodsList = {
    input: SwapMethodsList;
    output: SwapMethodsList;
};

export const EXACT_INPUT_REGULAR_SWAP_METHOD: RegularSwapMethodsList = {
    TOKENS_TO_TOKENS: 'swapExactTokensForTokens',
    ETH_TO_TOKENS: 'swapExactETHForTokens',
    TOKENS_TO_ETH: 'swapExactTokensForETH'
};

export const EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD: SupportingFeeSwapMethodsList = {
    TOKENS_TO_TOKENS_SUPPORTING_FEE: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
    ETH_TO_TOKENS_SUPPORTING_FEE: 'swapExactETHForTokensSupportingFeeOnTransferTokens',
    TOKENS_TO_ETH_SUPPORTING_FEE: 'swapExactTokensForETHSupportingFeeOnTransferTokens'
};

export const EXACT_INPUT_SWAP_METHOD: SwapMethodsList = {
    ...EXACT_INPUT_REGULAR_SWAP_METHOD,
    ...EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD
};

export const EXACT_OUTPUT_REGULAR_SWAP_METHOD: RegularSwapMethodsList = {
    TOKENS_TO_TOKENS: 'swapTokensForExactTokens',
    ETH_TO_TOKENS: 'swapETHForExactTokens',
    TOKENS_TO_ETH: 'swapTokensForExactETH'
};

export const EXACT_OUTPUT_SUPPORTING_FEE_SWAP_METHOD: SupportingFeeSwapMethodsList = {
    TOKENS_TO_TOKENS_SUPPORTING_FEE: 'swapTokensForExactTokensSupportingFeeOnTransferTokens',
    ETH_TO_TOKENS_SUPPORTING_FEE: 'swapETHForExactTokensSupportingFeeOnTransferTokens',
    TOKENS_TO_ETH_SUPPORTING_FEE: 'swapTokensForExactETHSupportingFeeOnTransferTokens'
};

export const EXACT_OUTPUT_SWAP_METHOD: SwapMethodsList = {
    ...EXACT_OUTPUT_REGULAR_SWAP_METHOD,
    ...EXACT_OUTPUT_SUPPORTING_FEE_SWAP_METHOD
};

export const SWAP_METHOD: ExactInputOutputSwapMethodsList = {
    input: EXACT_INPUT_SWAP_METHOD,
    output: EXACT_OUTPUT_SWAP_METHOD
};

export const SUPPORTING_FEE_SWAP_METHODS_MAPPING = {
    TOKENS_TO_TOKENS: 'TOKENS_TO_TOKENS_SUPPORTING_FEE',
    ETH_TO_TOKENS: 'ETH_TO_TOKENS_SUPPORTING_FEE',
    TOKENS_TO_ETH: 'TOKENS_TO_ETH_SUPPORTING_FEE'
} as const;
