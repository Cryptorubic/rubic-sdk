import { Injector } from 'src/core/injector/injector';
import {
    Route,
    RoutesRequest,
    RoutesResponse
} from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/models/lifi-route';

import { LifiOnChainTransactionRequest } from '../models/lifi-on-chain-transaction-request';

export class LifiOnChainApiService {
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
        slippage: number
    ): Promise<{ transactionRequest: LifiOnChainTransactionRequest; estimate: Route }> {
        const result = await Injector.httpClient.get<{
            transactionRequest: LifiOnChainTransactionRequest;
            estimate: Route;
        }>(`${this.LIFI_API_ENDPOINT}/quote`, {
            params: {
                fromChain,
                toChain,
                fromToken,
                toToken,
                fromAmount,
                fromAddress,
                slippage,
                integrator: 'rubic'
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
