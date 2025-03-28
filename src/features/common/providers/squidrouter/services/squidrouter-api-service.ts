import { Injector } from 'src/core/injector/injector';
import { SquidrouterApiResponse } from 'src/features/cross-chain/status-manager/models/squidrouter-api-response';

import { SquidrouterTransactionRequest } from '../models/transaction-request';
import {
    SquidrouterTransactionResponse,
    SquidrouterTxStatusParams
} from '../models/transaction-response';

export class SquidRouterApiService {
    private static readonly baseUrl = 'https://apiplus.squidrouter.com/v2';

    private static apiKey = 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4';

    private static readonly coralId = 'rubic-api-test';

    public static async getRoute(
        requestParams: SquidrouterTransactionRequest
    ): Promise<SquidrouterTransactionResponse> {
        const res = await Injector.httpClient.post<SquidrouterTransactionResponse>(
            'https://x-api.rubic.exchange/test_squidrouter/api/route',
            requestParams,
            {
                headers: {
                    apikey: SquidRouterApiService.apiKey,
                    'x-integrator-id': this.coralId
                }
            }
        );

        return res;
    }

    public static getTxStatus(params: SquidrouterTxStatusParams): Promise<SquidrouterApiResponse> {
        return Injector.httpClient.get<SquidrouterApiResponse>(
            `${SquidRouterApiService.baseUrl}/status`,
            {
                params: {
                    ...params
                },
                headers: {
                    'x-integrator-id': this.coralId
                }
            }
        );
    }
}
