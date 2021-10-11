export enum EXACT_INPUT_SWAP_METHOD {
    TOKENS_TO_TOKENS = 'swapExactTokensForTokens',
    ETH_TO_TOKENS = 'swapExactETHForTokens',
    TOKENS_TO_ETH = 'swapExactTokensForETH',
    TOKENS_TO_TOKENS_SUPPORTING_FEE = 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
    ETH_TO_TOKENS_SUPPORTING_FEE = 'swapExactETHForTokensSupportingFeeOnTransferTokens',
    TOKENS_TO_ETH_SUPPORTING_FEE = 'swapExactTokensForETHSupportingFeeOnTransferTokens'
}

export enum EXACT_OUTPUT_SWAP_METHOD {
    TOKENS_TO_TOKENS = 'swapTokensForExactTokens',
    ETH_TO_TOKENS = 'swapETHForExactTokens',
    TOKENS_TO_ETH = 'swapTokensForExactETH',
    TOKENS_TO_TOKENS_SUPPORTING_FEE = 'swapTokensForExactTokensSupportingFeeOnTransferTokens',
    ETH_TO_TOKENS_SUPPORTING_FEE = 'swapETHForExactTokensSupportingFeeOnTransferTokens',
    TOKENS_TO_ETH_SUPPORTING_FEE = 'swapTokensForExactETHSupportingFeeOnTransferTokens'
}

export const SWAP_METHOD = {
    input: EXACT_INPUT_SWAP_METHOD,
    output: EXACT_OUTPUT_SWAP_METHOD
}
