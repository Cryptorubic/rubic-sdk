import { TX_STATUS } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Injector } from 'src/core/injector/injector';
import { TxStatusData } from 'src/features/common/status-manager/models/tx-status-data';
import { RUBIC_X_API_OKU_APIKEY } from 'src/features/on-chain/calculation-manager/models/okuswap-api';

import { UniZenCcrTxResponse } from '../models/cross-chain-models/unizen-ccr-tx-response';
import { UniZenQuoteParams } from '../models/unizen-quote-params';
import { UniZenSwapParams } from '../models/unizen-swap-params';

export class UniZenApiService {
    private static apiEndpoint = 'https://x-api.rubic.exchange/unizen/trade/v1';

    public static getQuoteInfo<T>(
        params: UniZenQuoteParams,
        chainId: number,
        tradeType: 'cross' | 'single'
    ): Promise<T> {
        return Injector.httpClient.get<T>(
            `${UniZenApiService.apiEndpoint}/${chainId}/quote/${tradeType}`,
            {
                params: { ...params },
                headers: { apiKey: RUBIC_X_API_OKU_APIKEY }
            }
        );
    }

    public static getSwapInfo<T>(
        params: UniZenSwapParams,
        chainId: number,
        tradeType: 'cross' | 'single'
    ): Promise<T> {
        return Injector.httpClient.post<T>(
            `${UniZenApiService.apiEndpoint}/${chainId}/swap/${tradeType}`,
            params,
            {
                headers: { apiKey: RUBIC_X_API_OKU_APIKEY }
            }
        );
    }

    public static async getTxStatus(srcTxHash: string): Promise<TxStatusData> {
        try {
            const res = await Injector.httpClient.get<UniZenCcrTxResponse>(
                `${UniZenApiService.apiEndpoint}/info/tx/${srcTxHash}`,
                {
                    headers: { apiKey: RUBIC_X_API_OKU_APIKEY }
                }
            );

            const txStatus = res.status.toLowerCase();

            if (txStatus === 'delivered') {
                return {
                    hash: res.dstTxHash,
                    status: TX_STATUS.SUCCESS
                };
            }

            if (txStatus === 'failed') {
                return {
                    hash: null,
                    status: TX_STATUS.FAIL
                };
            }

            return {
                hash: null,
                status: TX_STATUS.PENDING
            };
        } catch {
            return {
                hash: null,
                status: TX_STATUS.PENDING
            };
        }
    }
}
