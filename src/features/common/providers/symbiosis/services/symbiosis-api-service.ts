import { RubicSdkError } from 'src/common/errors';
import { Injector } from 'src/core/injector/injector';

import { SYMBIOSIS_API_ENDPOINT } from '../constants/symbiosis-api-common';
import { SymbiosisErrorResponse } from '../models/symbiosis-api-common-types';
import {
    SymbiosisSwapRequestBody,
    SymbiosisSwapResponse
} from '../models/symbiosis-api-swap-types';

export class SymbiosisApiService {
    public static async getSwapTx(body: SymbiosisSwapRequestBody): Promise<SymbiosisSwapResponse> {
        const res = await Injector.httpClient.post<SymbiosisSwapResponse | SymbiosisErrorResponse>(
            `${SYMBIOSIS_API_ENDPOINT}/v1/swap`,
            body
        );

        if ('code' in res && 'message' in res) {
            throw new RubicSdkError(res.message);
        }

        return res;
    }
}
