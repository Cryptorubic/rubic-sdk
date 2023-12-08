import { RubicSdkError } from 'src/common/errors';
import { Injector } from 'src/core/injector/injector';
import { RANGO_API_ENDPOINT } from 'src/features/common/providers/rango/constants/rango-api-common';
import { RangoBestRouteResponse } from 'src/features/common/providers/rango/models/rango-api-best-route-types';
import { HttpClientParams } from 'src/features/common/providers/rango/models/rango-api-common-types';
import { RangoTxStatusResponse } from 'src/features/common/providers/rango/models/rango-api-status-types';
import { RangoSwapTransactionResponse } from 'src/features/common/providers/rango/models/rango-api-swap-types';
import {
    RangoBestRouteQueryParams,
    RangoSwapQueryParams,
    RangoTxStatusQueryParams
} from 'src/features/common/providers/rango/models/rango-parser-types';

export class RangoOnChainApiService {
    public static async getBestRoute(
        params: RangoBestRouteQueryParams
    ): Promise<RangoBestRouteResponse> {
        try {
            const res = await Injector.httpClient.get<RangoBestRouteResponse>(
                `${RANGO_API_ENDPOINT}/quote`,
                {
                    params: params as unknown as HttpClientParams
                }
            );

            if (!res.route || res.error) {
                throw new RubicSdkError(res.error ?? 'No available routes in rango.');
            }

            console.info('[CHOOSED_RANGO_PROVIDER]', res.route.swapper);
            return res;
        } catch (err) {
            throw new RubicSdkError(err);
        }
    }

    public static async getSwapTransaction(
        params: RangoSwapQueryParams
    ): Promise<RangoSwapTransactionResponse> {
        try {
            const res = await Injector.httpClient.get<RangoSwapTransactionResponse>(
                `${RANGO_API_ENDPOINT}/swap`,
                { params: params as unknown as HttpClientParams }
            );

            if (!res.route || res.error) {
                throw new RubicSdkError(res.error ?? 'No available routes in rango.');
            }
            return res;
        } catch (err) {
            throw new RubicSdkError(err);
        }
    }

    /**
     * @description Get transaction status data
     */
    public static async getTxStatus(
        params: RangoTxStatusQueryParams
    ): Promise<RangoTxStatusResponse> {
        try {
            const res = await Injector.httpClient.get<RangoTxStatusResponse>(
                `${RANGO_API_ENDPOINT}/status`,
                { params: params as unknown as HttpClientParams }
            );

            if (res.error || !res.bridgeData || !res.status) {
                throw new RubicSdkError(
                    "Can't get status, res has error or null data in getTxStatus method"
                );
            }

            return res;
        } catch (err) {
            throw new RubicSdkError(err);
        }
    }
}
