import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { Any } from 'src/common/utils/types';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';

import {
    RangoBestRouteResponse,
    RangoBestRouteSimulationResult,
    RangoCrossChainOptions
} from '../model/rango-types';
import { RangoCrossChainProvider } from '../rango-cross-chain-provider';
import { RangoParamsParser } from './rango-params-parser';

export class RangoCrossChainApiService {
    public static async getBestRoute(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RangoCrossChainOptions
    ): Promise<RangoBestRouteSimulationResult> {
        const params = RangoParamsParser.getBestRouteQueryParams(from, toToken, options) as Any;
        try {
            const { route } = await Injector.httpClient.get<RangoBestRouteResponse>(
                `${RangoCrossChainProvider.apiEndpoint}/quote`,
                {
                    params
                }
            );
            if (!route) throw new RubicSdkError('No available routes in rango.');
            return route;
        } catch (err) {
            throw new RubicSdkError(err);
        }
    }
}
