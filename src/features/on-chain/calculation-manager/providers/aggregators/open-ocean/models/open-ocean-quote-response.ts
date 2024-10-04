export interface OpenOceanQuoteResponse {
    error?: string;
    code: number;
    data: {
        outAmount: string;
        estimatedGas: number;
    };
}

export interface OpenOceanQuoteRequest {
    chain: string;
    inTokenAddress: string;
    outTokenAddress: string;
    amount: string;
    slippage: number;
    gasPrice: string;
    [key: string]: string | number;
}
