import { OpenOceanQuoteRequest } from './open-ocean-quote-response';

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

export type OpenOceanSwapQuoteRequest = OpenOceanQuoteRequest & {
    account: string;
    referrer: string;
};
