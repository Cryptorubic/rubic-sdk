import {
    ExactInputOutputSwapMethodsList,
    RegularSwapMethodsList,
    SupportingFeeSwapMethodsList,
    SwapMethodsList
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/constants/SWAP_METHOD';

export const KLAY_EXACT_INPUT_REGULAR_SWAP_METHOD: RegularSwapMethodsList = {
    TOKENS_TO_TOKENS: 'swapExactTokensForTokens',
    ETH_TO_TOKENS: 'swapExactKLAYForTokens',
    TOKENS_TO_ETH: 'swapExactTokensForSyscoin'
};

export const KLAY_EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD: SupportingFeeSwapMethodsList = {
    TOKENS_TO_TOKENS_SUPPORTING_FEE: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
    ETH_TO_TOKENS_SUPPORTING_FEE: 'swapExactKLAYForTokensSupportingFeeOnTransferTokens',
    TOKENS_TO_ETH_SUPPORTING_FEE: 'swapExactTokensForKLAYSupportingFeeOnTransferTokens'
};

export const KLAY_EXACT_INPUT_SWAP_METHOD: SwapMethodsList = {
    ...KLAY_EXACT_INPUT_REGULAR_SWAP_METHOD,
    ...KLAY_EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD
};

export const KLAY_EXACT_OUTPUT_REGULAR_SWAP_METHOD: RegularSwapMethodsList = {
    TOKENS_TO_TOKENS: 'swapTokensForExactTokens',
    ETH_TO_TOKENS: 'swapKLAYForExactTokens',
    TOKENS_TO_ETH: 'swapTokensForExactKLAY'
};

export const KLAY_EXACT_OUTPUT_SUPPORTING_FEE_SWAP_METHOD: SupportingFeeSwapMethodsList = {
    TOKENS_TO_TOKENS_SUPPORTING_FEE: 'swapTokensForExactTokensSupportingFeeOnTransferTokens',
    ETH_TO_TOKENS_SUPPORTING_FEE: 'swapKLAYForExactTokensSupportingFeeOnTransferTokens',
    TOKENS_TO_ETH_SUPPORTING_FEE: 'swapTokensForExactKLAYSupportingFeeOnTransferTokens'
};

export const KLAY_EXACT_OUTPUT_SWAP_METHOD: SwapMethodsList = {
    ...KLAY_EXACT_OUTPUT_REGULAR_SWAP_METHOD,
    ...KLAY_EXACT_OUTPUT_SUPPORTING_FEE_SWAP_METHOD
};

export const KLAY_SWAP_METHOD: ExactInputOutputSwapMethodsList = {
    input: KLAY_EXACT_INPUT_SWAP_METHOD,
    output: KLAY_EXACT_OUTPUT_SWAP_METHOD
};
