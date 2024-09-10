import { Injector } from 'src/core/injector/injector';
import { SquidrouterApiResponse } from 'src/features/cross-chain/status-manager/models/squidrouter-api-response';

import { SquidrouterTransactionRequest } from '../models/transaction-request';
import {
    SquidrouterTransactionResponse,
    SquidrouterTxStatusParams
} from '../models/transaction-response';

export class SquidRouterApiService {
    private static readonly baseUrl = 'https://apiplus.squidrouter.com/v2';

    public static async getRoute(
        requestParams: SquidrouterTransactionRequest
    ): Promise<SquidrouterTransactionResponse> {
        const res = await Injector.httpClient.post<{
            headers: { [key: string]: string };
            route: SquidrouterTransactionResponse;
        }>(`${SquidRouterApiService.baseUrl}/route`, requestParams, {
            headers: {
                'x-integrator-id': 'rubic-api'
            }
        });

        console.log(res.headers);
        return res.route;
    }

    public static getTxStatus(params: SquidrouterTxStatusParams): Promise<SquidrouterApiResponse> {
        return Injector.httpClient.get<SquidrouterApiResponse>(
            `${SquidRouterApiService.baseUrl}/status`,
            {
                params: {
                    ...params
                },
                headers: {
                    'x-integrator-id': 'rubic-api'
                }
            }
        );
    }
}
