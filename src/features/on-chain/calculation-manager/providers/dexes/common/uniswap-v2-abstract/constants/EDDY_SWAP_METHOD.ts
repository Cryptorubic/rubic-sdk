import {
    EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD,
    EXACT_OUTPUT_SWAP_METHOD,
    ExactInputOutputSwapMethodsList,
    RegularSwapMethodsList,
    SwapMethodsList
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/constants/SWAP_METHOD';

export const EDDY_EXACT_INPUT_REGULAR_SWAP_METHOD: RegularSwapMethodsList = {
    TOKENS_TO_TOKENS: 'swapEddyTokensForTokens',
    ETH_TO_TOKENS: 'swapEddyExactETHForTokens',
    TOKENS_TO_ETH: 'swapEddyExactTokensForEth'
};

export const EDDY_EXACT_INPUT_SWAP_METHOD: SwapMethodsList = {
    ...EDDY_EXACT_INPUT_REGULAR_SWAP_METHOD,
    ...EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD
};

export const EDDY_SWAP_METHOD: ExactInputOutputSwapMethodsList = {
    input: EDDY_EXACT_INPUT_SWAP_METHOD,
    output: EXACT_OUTPUT_SWAP_METHOD
};
