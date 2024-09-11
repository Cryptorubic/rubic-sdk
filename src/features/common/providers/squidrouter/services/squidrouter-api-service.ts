import axios from 'axios';
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
    ): Promise<{ tx: SquidrouterTransactionResponse; requestId: string }> {
        const res = await axios.post<SquidrouterTransactionResponse>(
            `${SquidRouterApiService.baseUrl}/route`,
            requestParams,
            {
                headers: {
                    'x-integrator-id': 'rubic-api'
                }
            }
        );

        return {
            tx: res.data,
            requestId: res.headers['x-request-id']
        };
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
