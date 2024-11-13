import {
    EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD,
    EXACT_OUTPUT_SUPPORTING_FEE_SWAP_METHOD,
    ExactInputOutputSwapMethodsList,
    RegularSwapMethodsList,
    SwapMethodsList
} from '../../../common/uniswap-v2-abstract/constants/SWAP_METHOD';

export const ENOSYS_EXACT_INPUT_REGULAR_SWAP_METHOD: RegularSwapMethodsList = {
    TOKENS_TO_TOKENS: 'swapExactTokensForTokens',
    ETH_TO_TOKENS: 'swapExactFLRForTokens',
    TOKENS_TO_ETH: 'swapExactTokensForFLR'
};

export const ENOSYS_EXACT_INPUT_SWAP_METHOD: SwapMethodsList = {
    ...ENOSYS_EXACT_INPUT_REGULAR_SWAP_METHOD,
    ...EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD
};

export const ENOSYS_EXACT_OUTPUT_REGULAR_SWAP_METHOD: RegularSwapMethodsList = {
    TOKENS_TO_TOKENS: 'swapTokensForExactTokens',
    ETH_TO_TOKENS: 'swapFLRForExactTokens',
    TOKENS_TO_ETH: 'swapTokensForExactFLR'
};

export const ENOSYS_EXACT_OUTPUT_SWAP_METHOD: SwapMethodsList = {
    ...ENOSYS_EXACT_OUTPUT_REGULAR_SWAP_METHOD,
    ...EXACT_OUTPUT_SUPPORTING_FEE_SWAP_METHOD
};

export const ENOSYS_METHOD: ExactInputOutputSwapMethodsList = {
    input: ENOSYS_EXACT_INPUT_SWAP_METHOD,
    output: ENOSYS_EXACT_OUTPUT_SWAP_METHOD
};
