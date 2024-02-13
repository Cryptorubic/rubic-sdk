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

export class DlnApiService {
    public static apiEndpoint = 'https://api.dln.trade/v1.0';

    public static fetchCrossChainQuote<T>(requestParams: EstimationRequest): Promise<T> {
        return Injector.httpClient.get<T>(`${DlnApiService.apiEndpoint}/dln/order/quote`, {
            params: requestParams as unknown as {}
        });
    }

    public static fetchCrossChainSwapData<T>(requestParams: TransactionRequest): Promise<T> {
        return Injector.httpClient.get<T>(`${DlnApiService.apiEndpoint}/dln/order/create-tx`, {
            params: requestParams as unknown as {}
        });
    }

    public static fetchOnChainQuote(
        requestParams: DlnOnChainEstimateRequest
    ): Promise<DlnOnChainEstimateResponse> {
        return Injector.httpClient.get<DlnOnChainEstimateResponse>(
            `${DlnApiService.apiEndpoint}/chain/estimation`,
            {
                params: requestParams as unknown as {}
            }
        );
    }

    public static fetchOnChainSwapData<T>(
        requestParams: DlnOnChainSwapRequest
    ): Promise<DlnOnChainSwapResponse<T>> {
        return Injector.httpClient.get<DlnOnChainSwapResponse<T>>(
            `${DlnApiService.apiEndpoint}/chain/transaction`,
            {
                params: requestParams as unknown as {}
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
            `${DlnApiService.apiEndpoint}/dln/order/${orderId}/status`
        );
    }

    public static fetchCrossChainOrdersByHash(
        sourceTransactionHash: string
    ): Promise<DeBridgeFilteredListApiResponse> {
        return Injector.httpClient.get<DeBridgeFilteredListApiResponse>(
            `${DlnApiService.apiEndpoint}/dln/tx/${sourceTransactionHash}/order-ids`
        );
    }
}
