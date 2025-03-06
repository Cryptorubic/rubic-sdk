import { Injector } from 'src/core/injector/injector';
import { EstimationRequest } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/estimation-request';
import { TransactionRequest } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/transaction-request';
import {
    DeBridgeFilteredListApiResponse,
    DeBridgeOrderApiResponse,
    DeBridgeOrderApiStatusResponse
} from 'src/features/cross-chain/status-manager/models/statuses-api';
import { DlnOnChainEstimateRequest } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/models/dln-on-chain-estimate-request';
import { DlnOnChainEstimateResponse } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/models/dln-on-chain-estimate-response';
import { DlnOnChainSwapRequest } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/models/dln-on-chain-swap-request';
import { DlnOnChainSwapResponse } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/models/dln-on-chain-swap-response';
import { RUBIC_X_API_APIKEY } from 'src/features/on-chain/calculation-manager/providers/aggregators/okuswap/constants/okuswap-api';

export class DlnApiService {
    private static xApiEndpoint = 'https://x-api.rubic.exchange/dln/v1.0';

    public static fetchCrossChainQuote<T>(requestParams: EstimationRequest): Promise<T> {
        return Injector.httpClient.get<T>(`${DlnApiService.xApiEndpoint}/dln/order/quote`, {
            params: requestParams as unknown as {},
            headers: { apiKey: RUBIC_X_API_APIKEY }
        });
    }

    public static fetchCrossChainSwapData<T>(requestParams: TransactionRequest): Promise<T> {
        return Injector.httpClient.get<T>(`${DlnApiService.xApiEndpoint}/dln/order/create-tx`, {
            params: requestParams as unknown as {}
        });
    }

    public static fetchOnChainQuote(
        requestParams: DlnOnChainEstimateRequest
    ): Promise<DlnOnChainEstimateResponse> {
        return Injector.httpClient.get<DlnOnChainEstimateResponse>(
            `${DlnApiService.xApiEndpoint}/chain/estimation`,
            {
                params: requestParams as unknown as {},
                headers: { apiKey: RUBIC_X_API_APIKEY }
            }
        );
    }

    public static fetchOnChainSwapData<T>(
        requestParams: DlnOnChainSwapRequest
    ): Promise<DlnOnChainSwapResponse<T>> {
        return Injector.httpClient.get<DlnOnChainSwapResponse<T>>(
            `${DlnApiService.xApiEndpoint}/chain/transaction`,
            {
                params: requestParams as unknown as {},
                headers: { apiKey: RUBIC_X_API_APIKEY }
            }
        );
    }

    public static fetchCrossChainEventMetaData(orderId: string): Promise<DeBridgeOrderApiResponse> {
        return Injector.httpClient.get<DeBridgeOrderApiResponse>(
            `https://stats-api.dln.trade/api/Orders/${orderId}`
        );
    }

    public static fetchCrossChainStatus(orderId: string): Promise<DeBridgeOrderApiStatusResponse> {
        return Injector.httpClient.get<DeBridgeOrderApiStatusResponse>(
            `${DlnApiService.xApiEndpoint}/dln/order/${orderId}/status`,
            { headers: { apiKey: RUBIC_X_API_APIKEY } }
        );
    }

    public static fetchCrossChainOrdersByHash(
        sourceTransactionHash: string
    ): Promise<DeBridgeFilteredListApiResponse> {
        return Injector.httpClient.get<DeBridgeFilteredListApiResponse>(
            `${DlnApiService.xApiEndpoint}/dln/tx/${sourceTransactionHash}/order-ids`,
            { headers: { apiKey: RUBIC_X_API_APIKEY } }
        );
    }
}
