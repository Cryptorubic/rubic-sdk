import { Injector } from 'src/core/injector/injector';

import {
    NativeRouterQuoteRequestParams,
    NativeRouterQuoteResponse
} from '../models/native-router-quote';

export class NativeRouterApiService {
    private static NATIVE_ROUTER_API_KEY = 'f78e017fa4039cf40c055d6e864bd90df27903cc';

    private static NATIVE_ROUTER_ENDPOINT = 'https://newapi.native.org/v1';

    public static async getFirmQuote(
        request: NativeRouterQuoteRequestParams
    ): Promise<NativeRouterQuoteResponse> {
        const result = await Injector.httpClient.get<NativeRouterQuoteResponse>(
            `${this.NATIVE_ROUTER_ENDPOINT}/firm-quote`,
            {
                params: { ...request },
                headers: {
                    apiKey: this.NATIVE_ROUTER_API_KEY
                }
            }
        );
        return result;
    }
}
