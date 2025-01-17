import { Injector } from 'src/core/injector/injector';

import {
    CROSS_CHAIN_DEPOSIT_STATUS,
    CrossChainDepositData
} from '../../common/cross-chain-transfer-trade/models/cross-chain-deposit-statuses';
import { SimpleSwapCurrency } from '../models/simple-swap-currency';
import {
    SimpleSwapEstimatonRequest,
    SimpleSwapExchange,
    SimpleSwapExchangeRequest,
    SimpleSwapRangesRequest
} from '../models/simple-swap-requests';

export class SimpleSwapApiService {
    private static readonly xApiKey = 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4';

    private static readonly apiEndpoint = 'https://x-api.rubic.exchange/simpleswap/v3';

    public static getAllCurrencies(): Promise<{ result: SimpleSwapCurrency[] }> {
        return Injector.httpClient.get(`${SimpleSwapApiService.apiEndpoint}/currencies`, {
            headers: { apikey: SimpleSwapApiService.xApiKey }
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
                headers: { apikey: SimpleSwapApiService.xApiKey }
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
                headers: { apikey: SimpleSwapApiService.xApiKey }
            }
        );

        return res.result.estimatedAmount;
    }

    public static createExchange(params: SimpleSwapExchangeRequest): Promise<SimpleSwapExchange> {
        return Injector.httpClient.post(`${SimpleSwapApiService.apiEndpoint}/exchanges`, params, {
            headers: {
                apikey: SimpleSwapApiService.xApiKey
            }
        });
    }

    public static async getTxStatus(id: string): Promise<CrossChainDepositData> {
        const res = await Injector.httpClient.get<SimpleSwapExchange>(
            `${SimpleSwapApiService.apiEndpoint}/exchanges/${id}`,
            {
                headers: {
                    apikey: SimpleSwapApiService.xApiKey
                }
            }
        );

        const txData = res.result;

        if (txData.status === 'refunded' || txData.status === 'finished') {
            return {
                status: CROSS_CHAIN_DEPOSIT_STATUS.FINISHED,
                dstHash: txData.txTo
            };
        }

        if (txData.status === 'failed' || txData.status === 'expired') {
            return {
                status: CROSS_CHAIN_DEPOSIT_STATUS.FAILED,
                dstHash: null
            };
        }

        const depositData: CrossChainDepositData = {
            status: txData.status,
            dstHash: null
        };

        return depositData;
    }
}
