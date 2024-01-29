import { Cache } from 'src/common/utils/decorators';
import { Injector } from 'src/core/injector/injector';
import { changenowApiKey } from 'src/features/common/providers/changenow/constants/changenow-api-key';
import { HttpClientParams } from 'src/features/common/providers/rango/models/rango-api-common-types';
import { ChangenowStatusResponse } from 'src/features/cross-chain/status-manager/models/changenow-api-response';

import { ChangenowCurrenciesResponse } from '../models/changenow-currencies-api';
import {
    ChangenowMinMapRangeRequestParams,
    ChangenowMinMaxRangeResponse
} from '../models/changenow-minmax-range-api';
import { ChangenowQuoteRequestParams, ChangenowQuoteResponse } from '../models/changenow-quote-api';
import { ChangenowSwapRequestBody, ChangenowSwapResponse } from '../models/changenow-swap.api';

export class ChangeNowCrossChainApiService {
    public static changenowApiEndpoint = 'https://api.changenow.io/v2';

    @Cache({
        maxAge: 15_000
    })
    public static getSwapTx(body: ChangenowSwapRequestBody): Promise<ChangenowSwapResponse> {
        return Injector.httpClient.post<ChangenowSwapResponse>(
            `${ChangeNowCrossChainApiService.changenowApiEndpoint}/exchange`,
            body,
            {
                headers: { 'x-changenow-api-key': changenowApiKey }
            }
        );
    }

    public static getQuoteTx(params: ChangenowQuoteRequestParams): Promise<ChangenowQuoteResponse> {
        return Injector.httpClient.get<ChangenowQuoteResponse>(
            `${ChangeNowCrossChainApiService.changenowApiEndpoint}/exchange/estimated-amount?flow=standard`,
            {
                params: params as unknown as HttpClientParams,
                headers: { 'x-changenow-api-key': changenowApiKey }
            }
        );
    }

    public static getMinMaxRange(
        params: ChangenowMinMapRangeRequestParams
    ): Promise<ChangenowMinMaxRangeResponse> {
        return Injector.httpClient.get<ChangenowMinMaxRangeResponse>(
            `${ChangeNowCrossChainApiService.changenowApiEndpoint}/exchange/range?flow=standard`,
            {
                params: params as unknown as HttpClientParams,
                headers: { 'x-changenow-api-key': changenowApiKey }
            }
        );
    }

    public static getCurrencies(): Promise<ChangenowCurrenciesResponse> {
        return Injector.httpClient.get<ChangenowCurrenciesResponse>(
            `${ChangeNowCrossChainApiService.changenowApiEndpoint}/exchange/currencies`,
            {
                params: { active: true, flow: 'standard' },
                headers: { 'x-changenow-api-key': changenowApiKey }
            }
        );
    }

    public static getTxStatus(changenowId: string): Promise<ChangenowStatusResponse> {
        return Injector.httpClient.get<ChangenowStatusResponse>(
            `${ChangeNowCrossChainApiService.changenowApiEndpoint}/exchange/by-id`,
            {
                params: { id: changenowId },
                headers: { 'x-changenow-api-key': changenowApiKey }
            }
        );
    }
}
