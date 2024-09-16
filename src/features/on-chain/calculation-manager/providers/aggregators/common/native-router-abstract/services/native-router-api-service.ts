import { Injector } from 'src/core/injector/injector';

import {
    NativeRouterQuoteRequestParams,
    NativeRouterQuoteResponse
} from '../models/native-router-quote';

export class NativeRouterApiService {
    private static apiKey = 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4';

    private static nativeRouterProxy = 'https://x-api.rubic.exchange/native/api/v1';

    public static async getFirmQuote(
        request: NativeRouterQuoteRequestParams
    ): Promise<NativeRouterQuoteResponse> {
        const result = await Injector.httpClient.get<NativeRouterQuoteResponse>(
            `${NativeRouterApiService.nativeRouterProxy}/firm-quote`,
            {
                params: { ...request },
                headers: { apiKey: NativeRouterApiService.apiKey }
            }
        );
        return result;
    }
}
