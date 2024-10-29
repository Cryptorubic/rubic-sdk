import { Injector } from 'src/core/injector/injector';

import { CrossChainDepositData } from '../../common/cross-chain-transfer-trade/models/cross-chain-deposit-statuses';
import { SimpleSwapCurrency } from '../models/simple-swap-currency';
import {
    SimpleSwapEstimatonRequest,
    SimpleSwapExchange,
    SimpleSwapExchangeRequest,
    SimpleSwapRangesRequest
} from '../models/simple-swap-requests';

export class SimpleSwapApiService {
    private static readonly apiKey = '10ae16f4-ff23-4da4-8bbc-e3a4c90cdddf';

    private static readonly apiEndpoint = 'https://api.simpleswap.io/v3';

    public static getAllCurrencies(): Promise<{ result: SimpleSwapCurrency[] }> {
        return Injector.httpClient.get(`${SimpleSwapApiService.apiEndpoint}/currencies`, {
            headers: { 'x-api-key': SimpleSwapApiService.apiKey }
        });
    }

    public static async getRanges(
        params: SimpleSwapRangesRequest
    ): Promise<{ min: string; max: string | null }> {
        const res = await Injector.httpClient.get<{ result: { min: string; max: string | null } }>(
            `${SimpleSwapApiService.apiEndpoint}/ranges`,
            {
                params: {
                    ...params
                },
                headers: { 'x-api-key': SimpleSwapApiService.apiKey }
            }
        );

        return res.result;
    }

    public static async getEstimation(params: SimpleSwapEstimatonRequest): Promise<string> {
        const res = await Injector.httpClient.get<{ result: { estimatedAmount: string } }>(
            `${SimpleSwapApiService.apiEndpoint}/estimates`,
            {
                params: {
                    ...params
                },
                headers: { 'x-api-key': SimpleSwapApiService.apiKey }
            }
        );

        return res.result.estimatedAmount;
    }

    public static createExchange(params: SimpleSwapExchangeRequest): Promise<SimpleSwapExchange> {
        return Injector.httpClient.post(`${SimpleSwapApiService.apiEndpoint}/exchanges`, params, {
            headers: {
                'x-api-key': SimpleSwapApiService.apiKey
            }
        });
    }

    public static async getTxStatus(id: string): Promise<CrossChainDepositData> {
        const res = await Injector.httpClient.get<SimpleSwapExchange>(
            `${SimpleSwapApiService.apiEndpoint}/exchanges/${id}`,
            {
                headers: {
                    'x-api-key': SimpleSwapApiService.apiKey
                }
            }
        );

        const depositData: CrossChainDepositData = {
            status: res.result.status,
            dstHash: res.result.txTo
        };

        return depositData;
    }
}
