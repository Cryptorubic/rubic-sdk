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

    private static readonly apiEndpoint = 'https://api.simpleswap.io';

    public static getAllCurrencies(): Promise<SimpleSwapCurrency[]> {
        return Injector.httpClient.get(`${SimpleSwapApiService.apiEndpoint}/get_all_currencies`, {
            params: {
                api_key: SimpleSwapApiService.apiKey
            }
        });
    }

    public static getRanges(
        params: SimpleSwapRangesRequest
    ): Promise<{ min: string; max: string | null }> {
        return Injector.httpClient.get(`${SimpleSwapApiService.apiEndpoint}/get_ranges`, {
            params: {
                api_key: SimpleSwapApiService.apiKey,
                ...params
            }
        });
    }

    public static getEstimation(params: SimpleSwapEstimatonRequest): Promise<string> {
        return Injector.httpClient.get(`${SimpleSwapApiService.apiEndpoint}/get_estimated`, {
            params: {
                api_key: SimpleSwapApiService.apiKey,
                ...params
            }
        });
    }

    public static createExchange(params: SimpleSwapExchangeRequest): Promise<SimpleSwapExchange> {
        return Injector.httpClient.post(
            `${SimpleSwapApiService.apiEndpoint}/create_exchange/?api_key=${SimpleSwapApiService.apiKey}`,
            params
        );
    }

    public static async getTxStatus(id: string): Promise<CrossChainDepositData> {
        const res = await Injector.httpClient.get<SimpleSwapExchange>(
            `${SimpleSwapApiService.apiEndpoint}/get_exchange`,
            {
                params: {
                    api_key: SimpleSwapApiService.apiKey,
                    id
                }
            }
        );

        const depositData: CrossChainDepositData = {
            status: res.status,
            dstHash: res.tx_to
        };

        return depositData;
    }
}
