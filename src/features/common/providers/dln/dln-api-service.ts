import { Injector } from 'src/core/injector/injector';
import { EstimationRequest } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/estimation-request';
import { TransactionRequest } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/transaction-request';

export class DlnApiService {
    public static apiEndpoint = 'https://api.dln.trade/v1.0/dln';

    public static fetchQuote<T>(requestParams: EstimationRequest): Promise<T> {
        return Injector.httpClient.get<T>(`${DlnApiService.apiEndpoint}/order/quote`, {
            params: requestParams as unknown as {}
        });
    }

    public static fetchSwapData<T>(requestParams: TransactionRequest): Promise<T> {
        return Injector.httpClient.get<T>(`${DlnApiService.apiEndpoint}/order/create-tx`, {
            params: requestParams as unknown as {}
        });
    }
}
