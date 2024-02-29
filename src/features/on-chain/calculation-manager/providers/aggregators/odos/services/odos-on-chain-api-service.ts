import { RubicSdkError } from 'src/common/errors';
import { Injector } from 'src/core/injector/injector';

import { ODOS_API_BASE_URL } from '../constants/odos-api-consts';
import {
    OdosBestRouteRequestBody,
    OdosBestRouteResponse
} from '../models/odos-api-best-route-types';
import { OdosSwapRequestBody, OdosSwapResponse } from '../models/odos-api-swap-types';

export class OdosOnChainApiService {
    public static async getBestRoute(
        body: OdosBestRouteRequestBody
    ): Promise<OdosBestRouteResponse> {
        const res = await Injector.httpClient.post<OdosBestRouteResponse>(
            `${ODOS_API_BASE_URL}/sor/quote/v2`,
            body
        );

        return res;
    }

    public static async getSwapTx(body: OdosSwapRequestBody): Promise<OdosSwapResponse> {
        const res = await Injector.httpClient.post<OdosSwapResponse>(
            `${ODOS_API_BASE_URL}/sor/assemble`,
            body
        );

        if (!res.transaction) {
            throw new RubicSdkError(`Transaction status is undefined!`);
        }

        return res;
    }
}
