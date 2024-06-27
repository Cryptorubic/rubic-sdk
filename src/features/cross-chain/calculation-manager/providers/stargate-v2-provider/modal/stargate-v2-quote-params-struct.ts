export interface StargateV2QuoteParamsStruct {
    dstEid: number;
    to: string;
    amountLD: string;
    minAmountLD: string;
    extraOptions: string;
    composeMsg: string;
    oftCmd: 1 | 0;
}

export interface StargateV2QuoteOFTResponse {
    amountSentLD?: string[];
    amountReceivedLD: string[];
}

export interface StargateV2MessagingFee {
    nativeFee: string;
    lzTokenFee: string;
}
