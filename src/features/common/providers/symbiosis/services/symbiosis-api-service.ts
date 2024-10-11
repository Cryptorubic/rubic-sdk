import { RubicSdkError } from 'src/common/errors';
import { Cache } from 'src/common/utils/decorators';
import { Injector } from 'src/core/injector/injector';
import { SymbiosisSwappingParams } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-swapping-params';
import { SymbiosisTradeData } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-trade-data';

import { SYMBIOSIS_API_ENDPOINT } from '../constants/symbiosis-api-common';
import { SymbiosisErrorResponse } from '../models/symbiosis-api-common-types';
import {
    SymbiosisSwapRequestBody,
    SymbiosisSwapResponse
} from '../models/symbiosis-api-swap-types';

export class SymbiosisApiService {
    /**
     * New method for all kind of swaps
     */
    @Cache({
        maxAge: 15_000
    })
    public static async getOnChainSwapTx(
        body: SymbiosisSwapRequestBody
    ): Promise<SymbiosisSwapResponse> {
        const res = await Injector.httpClient.post<SymbiosisSwapResponse | SymbiosisErrorResponse>(
            `${SYMBIOSIS_API_ENDPOINT}/v1/swap`,
            body
        );

        if ('code' in res && 'message' in res) {
            throw new RubicSdkError(res.message);
        }

        return res;
    }

    /**
     * @description Old method only for cross-chain swaps
     * @param params Swap request body
     */
    @Cache({
        maxAge: 15_000
    })
    public static async getCrossChainSwapTx(
        params: SymbiosisSwappingParams
    ): Promise<SymbiosisTradeData> {
        const res = await Injector.httpClient.post<SymbiosisTradeData | SymbiosisErrorResponse>(
            `${SYMBIOSIS_API_ENDPOINT}/v1/swap`,
            params
        );

        if ('code' in res && 'message' in res) {
            throw new RubicSdkError(res.message);
        }

        return res;
    }
}
