import { RubicSdkError } from 'src/common/errors';
import { Cache } from 'src/common/utils/decorators';
import { Injector } from 'src/core/injector/injector';
import {
    RANGO_X_API_ENDPOINT,
    RANGO_X_API_KEY
} from 'src/features/common/providers/rango/constants/rango-api-common';
import { RangoBestRouteResponse } from 'src/features/common/providers/rango/models/rango-api-best-route-types';
import { HttpClientParams } from 'src/features/common/providers/rango/models/rango-api-common-types';
import { RangoTxStatusResponse } from 'src/features/common/providers/rango/models/rango-api-status-types';
import { RangoSwapTransactionResponse } from 'src/features/common/providers/rango/models/rango-api-swap-types';
import {
    RangoBestRouteQueryParams,
    RangoSwapQueryParams,
    RangoTxStatusQueryParams
} from 'src/features/common/providers/rango/models/rango-parser-types';

export class RangoCrossChainApiService {
    public static async getBestRoute(
        params: RangoBestRouteQueryParams
    ): Promise<RangoBestRouteResponse> {
        const res = await Injector.httpClient.get<RangoBestRouteResponse>(
            `${RANGO_X_API_ENDPOINT}/quote`,
            {
                params: params as unknown as HttpClientParams,
                headers: { apiKey: RANGO_X_API_KEY }
            }
        );

        if (!res.route || res.error) {
            throw new RubicSdkError(res.error ?? 'No available routes in rango.');
        }

        return res;
    }

    @Cache({
        maxAge: 15_000
    })
    public static async getSwapTransaction(
        params: RangoSwapQueryParams
    ): Promise<RangoSwapTransactionResponse> {
        const res = await Injector.httpClient.get<RangoSwapTransactionResponse>(
            `${RANGO_X_API_ENDPOINT}/swap`,
            { params: params as unknown as HttpClientParams, headers: { apiKey: RANGO_X_API_KEY } }
        );

        if (!res.route || res.error) {
            throw new RubicSdkError(res.error ?? 'No available routes in rango.');
        }

        return res;
    }

    /**
     * @description Get transaction status data
     */
    public static async getTxStatus(
        params: RangoTxStatusQueryParams
    ): Promise<RangoTxStatusResponse> {
        const res = await Injector.httpClient.get<RangoTxStatusResponse>(
            `${RANGO_X_API_ENDPOINT}/status`,
            { params: params as unknown as HttpClientParams, headers: { apiKey: RANGO_X_API_KEY } }
        );

        if (res.error || !res.bridgeData || !res.status) {
            throw new RubicSdkError(
                "Can't get status, res has error or null data in getTxStatus method"
            );
        }

        return res;
    }
}
