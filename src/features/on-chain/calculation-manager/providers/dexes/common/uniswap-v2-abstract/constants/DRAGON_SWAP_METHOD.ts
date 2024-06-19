import {
    EXACT_OUTPUT_SWAP_METHOD,
    ExactInputOutputSwapMethodsList,
    RegularSwapMethodsList,
    SupportingFeeSwapMethodsList,
    SwapMethodsList
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/constants/SWAP_METHOD';

export const DRAGON_SWAP_EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD: SupportingFeeSwapMethodsList = {
    TOKENS_TO_TOKENS_SUPPORTING_FEE: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
    ETH_TO_TOKENS_SUPPORTING_FEE: 'swapExactSEIForTokensSupportingFeeOnTransferTokens',
    TOKENS_TO_ETH_SUPPORTING_FEE: 'swapExactTokensForSEISupportingFeeOnTransferTokens'
};

export const DRAGON_SWAP_EXACT_INPUT_REGULAR_SWAP_METHOD: RegularSwapMethodsList = {
    TOKENS_TO_TOKENS: 'swapExactTokensForTokens',
    ETH_TO_TOKENS: 'swapExactSEIForTokens',
    TOKENS_TO_ETH: 'swapExactTokensForSEI'
};

export const DRAGON_SWAP_EXACT_INPUT_SWAP_METHOD: SwapMethodsList = {
    ...DRAGON_SWAP_EXACT_INPUT_REGULAR_SWAP_METHOD,
    ...DRAGON_SWAP_EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD
};

export const DRAGON_SWAP_METHOD: ExactInputOutputSwapMethodsList = {
    input: DRAGON_SWAP_EXACT_INPUT_SWAP_METHOD,
    output: EXACT_OUTPUT_SWAP_METHOD
};
