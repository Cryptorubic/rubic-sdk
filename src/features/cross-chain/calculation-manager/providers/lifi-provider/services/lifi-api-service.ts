import { Injector } from 'src/core/injector/injector';

import { Estimate } from '../models/lifi-fee-cost';
import { RoutesRequest, RoutesResponse } from '../models/lifi-route';
import { LifiTransactionRequest } from '../models/lifi-transaction-request';

export class LifiApiService {
    private static LIFI_API_ENDPOINT = 'https://li.quest/v1';

    private static LIFI_API_KEY =
        '0a1eec2c-b1bd-4dc1-81cf-c988f099c929.f5950d26-5955-4e21-9db2-77ad984ea575';

    public static async getQuote(
        fromChain: number,
        toChain: number,
        fromToken: string,
        toToken: string,
        fromAmount: string,
        fromAddress: string,
        toAddress: string,
        slippage: number,
        rubicFee?: number
    ): Promise<{ transactionRequest: LifiTransactionRequest; estimate: Estimate }> {
        const result = await Injector.httpClient.get<{
            transactionRequest: LifiTransactionRequest;
            estimate: Estimate;
        }>(`${this.LIFI_API_ENDPOINT}/quote`, {
            params: {
                fromChain,
                toChain,
                fromToken,
                toToken,
                fromAmount,
                fromAddress,
                toAddress,
                slippage,
                integrator: 'rubic',
                ...(rubicFee && { fee: rubicFee })
            },
            headers: { 'x-lifi-api-key': this.LIFI_API_KEY }
        });
        return result;
    }

    public static async getRoutes(request: RoutesRequest): Promise<RoutesResponse> {
        const result = await Injector.httpClient.post<RoutesResponse>(
            `${this.LIFI_API_ENDPOINT}/advanced/routes`,
            request,
            {
                headers: { 'x-lifi-api-key': this.LIFI_API_KEY }
            }
        );

        return result;
    }
}
