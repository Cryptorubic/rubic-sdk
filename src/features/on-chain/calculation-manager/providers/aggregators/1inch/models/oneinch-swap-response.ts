export interface OneinchSwapResponse {
    tx: {
        from: string;
        to: string;
        data: string;
        value: string;
        gasPrice: string;
        gas: number;
    };
    dstAmount: string;
    error?: number;
    protocols: [{ fromTokenAddress: string; toTokenAddress: string }[][]];
}
