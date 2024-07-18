import { Injector } from 'src/core/injector/injector';

import { RouterQuoteResponseConfig } from '../models/router-quote-response-config';
import { RouterQuoteSendParams } from '../models/router-quote-send-params';
import {
    RouterSendTransactionParams,
    RouterSendTransactionResponse
} from '../models/router-send-transaction-params';

export class RouterApiService {
    private static readonly ROUTER_ENDPOINT =
        'https://api-beta.pathfinder.routerprotocol.com/api/v2';

    private static readonly partnerId = 0;

    public static async getQuote(
        params: RouterQuoteSendParams
    ): Promise<RouterQuoteResponseConfig> {
        return Injector.httpClient.get<RouterQuoteResponseConfig>(`${this.ROUTER_ENDPOINT}/quote`, {
            params: { ...params, partnerId: this.partnerId }
        });
    }

    public static async getSwapTx(
        params: RouterSendTransactionParams
    ): Promise<RouterSendTransactionResponse> {
        return Injector.httpClient.post<RouterSendTransactionResponse>(
            `${this.ROUTER_ENDPOINT}/transaction`,
            params
        );
    }
}
