import { Injector } from 'src/core/injector/injector';

import { Estimate } from '../models/lifi-fee-cost';
import { RoutesRequest, RoutesResponse } from '../models/lifi-route';
import { LifiTransactionRequest } from '../models/lifi-transaction-request';

export class LifiApiService {
    private static LIFI_API_ENDPOINT = 'https://li.quest/v1';

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
            }
        });
        return result;
    }

    public static async getRoutes(request: RoutesRequest): Promise<RoutesResponse> {
        const result = await Injector.httpClient.post<RoutesResponse>(
            `${this.LIFI_API_ENDPOINT}/advanced/routes`,
            request
        );

        return result;
    }
}
