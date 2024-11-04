import { TX_STATUS } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Injector } from 'src/core/injector/injector';
import { TxStatusData } from 'src/features/common/status-manager/models/tx-status-data';

import { UniZenCcrTxResponse } from '../models/cross-chain-models/unizen-ccr-tx-response';
import { UniZenQuoteParams } from '../models/unizen-quote-params';
import { UniZenSwapParams } from '../models/unizen-swap-params';

export class UniZenApiService {
    private static apiKey = 'e6d1723c-040f-4c9f-b81c-1129664ece88';

    private static apiEndpoint = 'http://localhost:3000';

    public static getQuoteInfo<T>(
        params: UniZenQuoteParams,
        chainId: number,
        tradeType: 'cross' | 'single'
    ): Promise<T> {
        return Injector.httpClient.get<T>(
            `${UniZenApiService.apiEndpoint}/${chainId}/quote/${tradeType}`,
            {
                params: { ...params },
                headers: { apiKey: UniZenApiService.apiKey }
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
                headers: { apiKey: UniZenApiService.apiKey }
            }
        );
    }

    public static async getTxStatus(srcTxHash: string): Promise<TxStatusData> {
        const res = await Injector.httpClient.get<UniZenCcrTxResponse>(
            `${UniZenApiService.apiEndpoint}/info/tx/${srcTxHash}`
        );

        if (res.status === 'DELIVERED') {
            return {
                hash: res.dstTxHash,
                status: TX_STATUS.SUCCESS
            };
        }

        return {
            hash: null,
            status: TX_STATUS.PENDING
        };
    }
}
