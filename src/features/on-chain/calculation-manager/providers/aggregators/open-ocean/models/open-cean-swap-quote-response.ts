export interface OpenoceanSwapQuoteResponse {
    code: number;
    data: {
        data: string;
        outAmount: string;
        value: string;
        to: string;
    };
    error?: string;
}

export interface OpenoceanSuiSwapQuoteResponse {
    code: number;
    data: {
        data: string;
        outAmount: string;
    };
    error?: string;
}
