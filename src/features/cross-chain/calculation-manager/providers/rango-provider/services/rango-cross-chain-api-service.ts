import { RubicSdkError } from 'src/common/errors';
import { Injector } from 'src/core/injector/injector';

import { RangoBestRouteResponse } from '../model/rango-api-best-route-types';
import { HttpClientParams } from '../model/rango-api-common-types';
import { RangoTxStatusResponse } from '../model/rango-api-status-types';
import { RangoSwapTransactionResponse } from '../model/rango-api-swap-types';
import {
    RangoBestRouteQueryParams,
    RangoSwapQueryParams,
    RangoTxStatusQueryParams
} from '../model/rango-parser-types';
import { RangoCrossChainProvider } from '../rango-cross-chain-provider';
export class RangoApiService {
    public static async getBestRoute(
        params: RangoBestRouteQueryParams
    ): Promise<RangoBestRouteResponse> {
        try {
            const res = await Injector.httpClient.get<RangoBestRouteResponse>(
                `${RangoCrossChainProvider.apiEndpoint}/quote`,
                {
                    params: params as unknown as HttpClientParams
                }
            );

            if (!res.route || res.error)
                throw new RubicSdkError(res.error ?? 'No available routes in rango.');
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
                `${RangoCrossChainProvider.apiEndpoint}/swap`,
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
                `${RangoCrossChainProvider.apiEndpoint}/status`,
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
