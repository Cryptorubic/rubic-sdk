import {
    ExactInputOutputSwapMethodsList,
    RegularSwapMethodsList,
    SupportingFeeSwapMethodsList,
    SwapMethodsList
} from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/constants/SWAP_METHOD';

export const ETH_EXACT_INPUT_REGULAR_SWAP_METHOD: RegularSwapMethodsList = {
    TOKENS_TO_TOKENS: 'swapExactTokensForTokens',
    ETH_TO_TOKENS: 'swapExactETHForTokens',
    TOKENS_TO_ETH: 'swapExactTokensForETH'
};

export const ETH_EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD: SupportingFeeSwapMethodsList = {
    TOKENS_TO_TOKENS_SUPPORTING_FEE: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
    ETH_TO_TOKENS_SUPPORTING_FEE: 'swapExactETHForTokensSupportingFeeOnTransferTokens',
    TOKENS_TO_ETH_SUPPORTING_FEE: 'swapExactTokensForETHSupportingFeeOnTransferTokens'
};

export const ETH_EXACT_INPUT_SWAP_METHOD: SwapMethodsList = {
    ...ETH_EXACT_INPUT_REGULAR_SWAP_METHOD,
    ...ETH_EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD
};

export const ETH_EXACT_OUTPUT_REGULAR_SWAP_METHOD: RegularSwapMethodsList = {
    TOKENS_TO_TOKENS: 'swapTokensForExactTokens',
    ETH_TO_TOKENS: 'swapETHForExactTokens',
    TOKENS_TO_ETH: 'swapTokensForExactETH'
};

export const ETH_EXACT_OUTPUT_SUPPORTING_FEE_SWAP_METHOD: SupportingFeeSwapMethodsList = {
    TOKENS_TO_TOKENS_SUPPORTING_FEE: 'swapTokensForExactTokensSupportingFeeOnTransferTokens',
    ETH_TO_TOKENS_SUPPORTING_FEE: 'swapETHForExactTokensSupportingFeeOnTransferTokens',
    TOKENS_TO_ETH_SUPPORTING_FEE: 'swapTokensForExactETHSupportingFeeOnTransferTokens'
};

export const ETH_EXACT_OUTPUT_SWAP_METHOD: SwapMethodsList = {
    ...ETH_EXACT_OUTPUT_REGULAR_SWAP_METHOD,
    ...ETH_EXACT_OUTPUT_SUPPORTING_FEE_SWAP_METHOD
};

export const ETH_SWAP_METHOD: ExactInputOutputSwapMethodsList = {
    input: ETH_EXACT_INPUT_SWAP_METHOD,
    output: ETH_EXACT_OUTPUT_SWAP_METHOD
};
