import {
    ExactInputOutputSwapMethodsList,
    RegularSwapMethodsList,
    SupportingFeeSwapMethodsList,
    SwapMethodsList
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/constants/SWAP_METHOD';

export const AVALANCHE_EXACT_INPUT_REGULAR_SWAP_METHOD: RegularSwapMethodsList = {
    TOKENS_TO_TOKENS: 'swapExactTokensForTokens',
    ETH_TO_TOKENS: 'swapExactAVAXForTokens',
    TOKENS_TO_ETH: 'swapExactTokensForAVAX'
};

export const AVALANCHE_EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD: SupportingFeeSwapMethodsList = {
    TOKENS_TO_TOKENS_SUPPORTING_FEE: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
    ETH_TO_TOKENS_SUPPORTING_FEE: 'swapExactAVAXForTokensSupportingFeeOnTransferTokens',
    TOKENS_TO_ETH_SUPPORTING_FEE: 'swapExactTokensForAVAXSupportingFeeOnTransferTokens'
};

export const AVALANCHE_EXACT_INPUT_SWAP_METHOD: SwapMethodsList = {
    ...AVALANCHE_EXACT_INPUT_REGULAR_SWAP_METHOD,
    ...AVALANCHE_EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD
};

export const AVALANCHE_EXACT_OUTPUT_REGULAR_SWAP_METHOD: RegularSwapMethodsList = {
    TOKENS_TO_TOKENS: 'swapTokensForExactTokens',
    ETH_TO_TOKENS: 'swapAVAXForExactTokens',
    TOKENS_TO_ETH: 'swapTokensForExactAVAX'
};

export const AVALANCHE_EXACT_OUTPUT_SUPPORTING_FEE_SWAP_METHOD: SupportingFeeSwapMethodsList = {
    TOKENS_TO_TOKENS_SUPPORTING_FEE: 'swapTokensForExactTokensSupportingFeeOnTransferTokens',
    ETH_TO_TOKENS_SUPPORTING_FEE: 'swapAVAXForExactTokensSupportingFeeOnTransferTokens',
    TOKENS_TO_ETH_SUPPORTING_FEE: 'swapTokensForExactAVAXSupportingFeeOnTransferTokens'
};

export const AVALANCHE_EXACT_OUTPUT_SWAP_METHOD: SwapMethodsList = {
    ...AVALANCHE_EXACT_OUTPUT_REGULAR_SWAP_METHOD,
    ...AVALANCHE_EXACT_OUTPUT_SUPPORTING_FEE_SWAP_METHOD
};

export const AVALANCHE_SWAP_METHOD: ExactInputOutputSwapMethodsList = {
    input: AVALANCHE_EXACT_INPUT_SWAP_METHOD,
    output: AVALANCHE_EXACT_OUTPUT_SWAP_METHOD
};
