export interface OpenOceanQuoteResponse {
    error?: string;
    code: number;
    data: {
        outAmount: string;
        estimatedGas: number;
    };
}
