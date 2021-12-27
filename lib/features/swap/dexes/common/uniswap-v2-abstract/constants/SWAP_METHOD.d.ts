export declare type RegularSwapMethod = 'TOKENS_TO_TOKENS' | 'ETH_TO_TOKENS' | 'TOKENS_TO_ETH';
export declare type SupportingFeeSwapMethod = 'TOKENS_TO_TOKENS_SUPPORTING_FEE' | 'ETH_TO_TOKENS_SUPPORTING_FEE' | 'TOKENS_TO_ETH_SUPPORTING_FEE';
export declare type RegularSwapMethodsList = Record<RegularSwapMethod, string>;
export declare type SupportingFeeSwapMethodsList = Record<SupportingFeeSwapMethod, string>;
export declare type SwapMethodsList = RegularSwapMethodsList & SupportingFeeSwapMethodsList;
export declare type ExactInputOutputSwapMethodsList = {
    input: SwapMethodsList;
    output: SwapMethodsList;
};
export declare const EXACT_INPUT_REGULAR_SWAP_METHOD: RegularSwapMethodsList;
export declare const EXACT_INPUT_SUPPORTING_FEE_SWAP_METHOD: SupportingFeeSwapMethodsList;
export declare const EXACT_INPUT_SWAP_METHOD: SwapMethodsList;
export declare const EXACT_OUTPUT_REGULAR_SWAP_METHOD: RegularSwapMethodsList;
export declare const EXACT_OUTPUT_SUPPORTING_FEE_SWAP_METHOD: SupportingFeeSwapMethodsList;
export declare const EXACT_OUTPUT_SWAP_METHOD: SwapMethodsList;
export declare const SWAP_METHOD: ExactInputOutputSwapMethodsList;
export declare const SUPPORTING_FEE_SWAP_METHODS_MAPPING: {
    readonly TOKENS_TO_TOKENS: "TOKENS_TO_TOKENS_SUPPORTING_FEE";
    readonly ETH_TO_TOKENS: "ETH_TO_TOKENS_SUPPORTING_FEE";
    readonly TOKENS_TO_ETH: "TOKENS_TO_ETH_SUPPORTING_FEE";
};
