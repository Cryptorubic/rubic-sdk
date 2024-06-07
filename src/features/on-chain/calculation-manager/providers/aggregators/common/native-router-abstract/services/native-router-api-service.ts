import { Injector } from 'src/core/injector/injector';

import {
    NativeRouterQuoteRequestParams,
    NativeRouterQuoteResponse
} from '../models/native-router-quote';
import { NativeRouterChain } from '../models/native-router-transaction-request';

export class NativeRouterApiService {
    private static NATIVE_ROUTER_API_KEY = 'f78e017fa4039cf40c055d6e864bd90df27903cc';

    private static NATIVE_ROUTER_ENDPOINT = 'https://newapi.native.org/v1';

    public static async getFirmQuote(
        request: NativeRouterQuoteRequestParams
    ): Promise<NativeRouterQuoteResponse> {
        const result = await Injector.httpClient.get<NativeRouterQuoteResponse>(
            `${this.NATIVE_ROUTER_ENDPOINT}/firm-quote`,
            {
                params: {
                    src_chain: request.srcChain.toLowerCase(),
                    dst_chain: request.dstChain.toLowerCase(),
                    token_in: request.tokenIn,
                    token_out: request.tokenOut,
                    from_address: request.fromAddress,
                    amount: request.amount,
                    slippage: request.slippage as number
                },
                headers: {
                    apiKey: this.NATIVE_ROUTER_API_KEY
                }
            }
        );
        return result;
    }

    // public static async getIndicativeQuote(request: NativeRouterQuoteRequestParams): Promise<NativeRouterQuoteResponse> {
    //     const result = await Injector.httpClient.get(
    //         `${this.NATIVE_ROUTER_ENDPOINT}/indicative-quote`,
    //         {
    //             params: {
    //                 ...request
    //             },
    //             headers: {
    //                 apiKey: this.NATIVE_ROUTER_API_KEY
    //             }
    //         }
    //     );
    //     return result;
    // }

    public static async getChains(): Promise<NativeRouterChain[]> {
        const result = await Injector.httpClient.get<NativeRouterChain[]>(
            `${this.NATIVE_ROUTER_ENDPOINT}/chains`,
            {
                headers: {
                    apiKey: this.NATIVE_ROUTER_API_KEY,
                    accept: 'application/json'
                }
            }
        );
        return result;
    }
}
