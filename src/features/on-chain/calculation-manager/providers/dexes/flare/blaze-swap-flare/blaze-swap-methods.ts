import {
    EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD,
    EXACT_OUTPUT_SUPPORTING_FEE_SWAP_METHOD,
    ExactInputOutputSwapMethodsList,
    RegularSwapMethodsList,
    SwapMethodsList
} from '../../common/uniswap-v2-abstract/constants/SWAP_METHOD';

export const BLAZE_SWAP_EXACT_INPUT_REGULAR_SWAP_METHOD: RegularSwapMethodsList = {
    TOKENS_TO_TOKENS: 'swapExactTokensForTokens',
    ETH_TO_TOKENS: 'swapExactNATForTokens',
    TOKENS_TO_ETH: 'swapExactTokensForNAT'
};

export const BLAZE_SWAP_EXACT_INPUT_SWAP_METHOD: SwapMethodsList = {
    ...BLAZE_SWAP_EXACT_INPUT_REGULAR_SWAP_METHOD,
    ...EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD
};

export const BLAZE_SWAP_EXACT_OUTPUT_REGULAR_SWAP_METHOD: RegularSwapMethodsList = {
    TOKENS_TO_TOKENS: 'swapTokensForExactTokens',
    ETH_TO_TOKENS: 'swapNATForExactTokens',
    TOKENS_TO_ETH: 'swapTokensForExactNAT'
};

export const BLAZE_SWAP_EXACT_OUTPUT_SWAP_METHOD: SwapMethodsList = {
    ...BLAZE_SWAP_EXACT_OUTPUT_REGULAR_SWAP_METHOD,
    ...EXACT_OUTPUT_SUPPORTING_FEE_SWAP_METHOD
};

export const BLAZE_SWAP_METHOD: ExactInputOutputSwapMethodsList = {
    input: BLAZE_SWAP_EXACT_INPUT_SWAP_METHOD,
    output: BLAZE_SWAP_EXACT_OUTPUT_SWAP_METHOD
};
