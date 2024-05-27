import { Step } from "@lifi/sdk";
import { Injector } from "src/core/injector/injector";
import { HttpClientParams } from "src/features/common/providers/rango/models/rango-api-common-types";
import { LIFI_API_ENDPOINT, LIFI_API_KEY } from "../constants/lifi-api";
import { Estimate } from "../models/lifi-fee-cost";
import { RouteOptions, RoutesRequest, RoutesResponse } from "../models/lifi-route";
import { LifiTransactionRequest } from "../models/lifi-transaction-request";

export class LifiApiService {
    public static async getQuote(
        fromChain: number,
        toChain: number,
        fromToken: string,
        toToken: string,
        fromAmount: string,
        fromAddress: string
    ): Promise<{ transactionRequest: LifiTransactionRequest; estimate: Estimate }> {
        const result = await Injector.httpClient.get<{ transactionRequest: LifiTransactionRequest; estimate: Estimate }>(`${LIFI_API_ENDPOINT}/quote`, {
            params: {
                fromChain,
                toChain,
                fromToken,
                toToken,
                fromAmount,
                fromAddress
            }
        })
        return result
    }

    public static async getRoutes(request: RoutesRequest): Promise<RoutesResponse> {
        const result = await Injector.httpClient.post<RoutesResponse>(`${LIFI_API_ENDPOINT}/advanced/routes`, request,
            {
                headers: { 'x-lifi-api-key': LIFI_API_KEY }
            }
        )

        return result
    }
}