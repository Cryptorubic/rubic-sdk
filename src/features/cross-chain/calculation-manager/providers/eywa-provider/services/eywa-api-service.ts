import { Injector } from 'src/core/injector/injector';

import { EywaFeeEstimation } from '../models/eywa-fee-estimation';
import { EywaTxStatusResponse } from '../models/eywa-tx-status-response';
import {
    EywaRoutingParams,
    EywaRoutingResponse,
    EywaSwapTxRequest,
    EywaSwapTxResponse
} from '../models/request-routing-params';

export class EywaApiService {
    private static readonly baseUrl = 'https://api.crosscurve.fi';

    public static getRoutes(params: EywaRoutingParams): Promise<EywaRoutingResponse[]> {
        return Injector.httpClient.post<EywaRoutingResponse[]>(
            `${EywaApiService.baseUrl}/routing/scan`,
            params
        );
    }

    public static getFeeEstimation(params: EywaRoutingResponse): Promise<EywaFeeEstimation> {
        return Injector.httpClient.post<EywaFeeEstimation>(
            `${EywaApiService.baseUrl}/estimate`,
            params
        );
    }

    public static getSwapTx(params: EywaSwapTxRequest): Promise<EywaSwapTxResponse> {
        return Injector.httpClient.post(`${EywaApiService.baseUrl}/tx/create`, params);
    }

    public static async getRequestId(srcHash: string, limit: number): Promise<string | undefined> {
        const { result } = await Injector.httpClient.get<{ result: { requestId: string }[] }>(
            `${EywaApiService.baseUrl}/search?search=${srcHash}&limit=${limit}`
        );

        return result[0]?.requestId;
    }

    public static getTxStatus(requestId: string): Promise<EywaTxStatusResponse> {
        return Injector.httpClient.get<EywaTxStatusResponse>(
            `${EywaApiService.baseUrl}/transaction/${requestId}`
        );
    }
}
