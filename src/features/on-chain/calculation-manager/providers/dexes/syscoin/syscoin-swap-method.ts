import {
    ExactInputOutputSwapMethodsList,
    RegularSwapMethodsList,
    SupportingFeeSwapMethodsList,
    SwapMethodsList
} from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/constants/SWAP_METHOD';

export const SYS_EXACT_INPUT_REGULAR_SWAP_METHOD: RegularSwapMethodsList = {
    TOKENS_TO_TOKENS: 'swapExactTokensForTokens',
    ETH_TO_TOKENS: 'swapExactSYSForTokens',
    TOKENS_TO_ETH: 'swapExactTokensForSyscoin'
};

export const SYS_EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD: SupportingFeeSwapMethodsList = {
    TOKENS_TO_TOKENS_SUPPORTING_FEE: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
    ETH_TO_TOKENS_SUPPORTING_FEE: 'swapExactSYSForTokensSupportingFeeOnTransferTokens',
    TOKENS_TO_ETH_SUPPORTING_FEE: 'swapExactTokensForSYSSupportingFeeOnTransferTokens'
};

export const SYS_EXACT_INPUT_SWAP_METHOD: SwapMethodsList = {
    ...SYS_EXACT_INPUT_REGULAR_SWAP_METHOD,
    ...SYS_EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD
};

export const SYS_EXACT_OUTPUT_REGULAR_SWAP_METHOD: RegularSwapMethodsList = {
    TOKENS_TO_TOKENS: 'swapTokensForExactTokens',
    ETH_TO_TOKENS: 'swapSYSForExactTokens',
    TOKENS_TO_ETH: 'swapTokensForExactSYS'
};

export const SYS_EXACT_OUTPUT_SUPPORTING_FEE_SWAP_METHOD: SupportingFeeSwapMethodsList = {
    TOKENS_TO_TOKENS_SUPPORTING_FEE: 'swapTokensForExactTokensSupportingFeeOnTransferTokens',
    ETH_TO_TOKENS_SUPPORTING_FEE: 'swapSYSForExactTokensSupportingFeeOnTransferTokens',
    TOKENS_TO_ETH_SUPPORTING_FEE: 'swapTokensForExactSYSSupportingFeeOnTransferTokens'
};

export const SYS_EXACT_OUTPUT_SWAP_METHOD: SwapMethodsList = {
    ...SYS_EXACT_OUTPUT_REGULAR_SWAP_METHOD,
    ...SYS_EXACT_OUTPUT_SUPPORTING_FEE_SWAP_METHOD
};

export const SYS_SWAP_METHOD: ExactInputOutputSwapMethodsList = {
    input: SYS_EXACT_INPUT_SWAP_METHOD,
    output: SYS_EXACT_OUTPUT_SWAP_METHOD
};
