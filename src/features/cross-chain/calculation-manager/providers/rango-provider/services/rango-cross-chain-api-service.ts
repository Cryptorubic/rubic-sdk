import { RangoClient } from 'rango-sdk-basic';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';

import {
    RangoBestRouteResponse,
    RangoBestRouteSimulationResult
} from '../model/rango-api-best-route-types';
import { HttpClientParams, RangoCrossChainOptions } from '../model/rango-api-common-types';
import { RangoSwapTransactionResponse } from '../model/rango-api-swap-types';
import { RangoCrossChainProvider } from '../rango-cross-chain-provider';
import { RangoParamsParser } from './rango-params-parser';
export class RangoApiService {
    private static rango = new RangoClient(RangoCrossChainProvider.apiKey);

    public static async getBestRoute(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RangoCrossChainOptions
    ): Promise<RangoBestRouteSimulationResult> {
        const params = RangoParamsParser.getBestRouteQueryParams(from, toToken, options);
        try {
            const { route, error } = await Injector.httpClient.get<RangoBestRouteResponse>(
                `${RangoCrossChainProvider.apiEndpoint}/quote`,
                {
                    params: params as unknown as HttpClientParams
                }
            );

            if (!route || error) throw new RubicSdkError(error ?? 'No available routes in rango.');
            return route;
        } catch (err) {
            throw new RubicSdkError(err);
        }
    }

    public static async getSwapTransaction(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>,
        options: RangoCrossChainOptions
    ): Promise<RangoSwapTransactionResponse> {
        try {
            const params = RangoParamsParser.getSwapQueryParams(fromToken, toToken, options);

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
}
