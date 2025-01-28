import { Injector } from 'src/core/injector/injector';
import {
    Route,
    RoutesRequest,
    RoutesResponse
} from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/models/lifi-route';

import { LifiOnChainTransactionRequest } from '../models/lifi-on-chain-transaction-request';

export class LifiOnChainApiService {
    private static LIFI_API_ENDPOINT = 'https://li.quest/v1';

    public static async getQuote(
        fromChain: number,
        toChain: number,
        fromToken: string,
        toToken: string,
        fromAmount: string,
        fromAddress: string,
        slippage: number,
        rubicFee?: number
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
