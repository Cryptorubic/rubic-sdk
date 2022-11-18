import {
    ExactInputOutputSwapMethodsList,
    RegularSwapMethodsList,
    SupportingFeeSwapMethodsList,
    SwapMethodsList
} from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/constants/SWAP_METHOD';

export const METIS_EXACT_INPUT_REGULAR_SWAP_METHOD: RegularSwapMethodsList = {
    TOKENS_TO_TOKENS: 'swapExactTokensForTokens',
    ETH_TO_TOKENS: 'swapExactMetisForTokens',
    TOKENS_TO_ETH: 'swapExactTokensForMetis'
};

export const METIS_EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD: SupportingFeeSwapMethodsList = {
    TOKENS_TO_TOKENS_SUPPORTING_FEE: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
    ETH_TO_TOKENS_SUPPORTING_FEE: 'swapExactMetisForTokensSupportingFeeOnTransferTokens',
    TOKENS_TO_ETH_SUPPORTING_FEE: 'swapExactTokensForMetisSupportingFeeOnTransferTokens'
};

export const METIS_EXACT_INPUT_SWAP_METHOD: SwapMethodsList = {
    ...METIS_EXACT_INPUT_REGULAR_SWAP_METHOD,
    ...METIS_EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD
};

export const METIS_EXACT_OUTPUT_REGULAR_SWAP_METHOD: RegularSwapMethodsList = {
    TOKENS_TO_TOKENS: 'swapTokensForExactTokens',
    ETH_TO_TOKENS: 'swapMetisForExactTokens',
    TOKENS_TO_ETH: 'swapTokensForExactMetis'
};

export const METIS_EXACT_OUTPUT_SUPPORTING_FEE_SWAP_METHOD: SupportingFeeSwapMethodsList = {
    TOKENS_TO_TOKENS_SUPPORTING_FEE: 'swapTokensForExactTokensSupportingFeeOnTransferTokens',
    ETH_TO_TOKENS_SUPPORTING_FEE: 'swapMetisForExactTokensSupportingFeeOnTransferTokens',
    TOKENS_TO_ETH_SUPPORTING_FEE: 'swapTokensForExactMetisSupportingFeeOnTransferTokens'
};

export const METIS_EXACT_OUTPUT_SWAP_METHOD: SwapMethodsList = {
    ...METIS_EXACT_OUTPUT_REGULAR_SWAP_METHOD,
    ...METIS_EXACT_OUTPUT_SUPPORTING_FEE_SWAP_METHOD
};

export const METIS_SWAP_METHOD: ExactInputOutputSwapMethodsList = {
    input: METIS_EXACT_INPUT_SWAP_METHOD,
    output: METIS_EXACT_OUTPUT_SWAP_METHOD
};
