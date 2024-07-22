import { TX_STATUS } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Injector } from 'src/core/injector/injector';
import { TxStatusData } from 'src/features/common/status-manager/models/tx-status-data';
import { CrossChainTradeData } from 'src/features/cross-chain/status-manager/models/cross-chain-trade-data';

import { RouterQuoteResponseConfig } from '../models/router-quote-response-config';
import { RouterQuoteSendParams } from '../models/router-quote-send-params';
import {
    RouterSendTransactionParams,
    RouterSendTransactionResponse,
    RouterTxStatusResponse
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

    public static async getTxStatus(data: CrossChainTradeData): Promise<TxStatusData> {
        const txData = await Injector.httpClient.get<RouterTxStatusResponse>(
            `${this.ROUTER_ENDPOINT}/status`,
            {
                params: {
                    srcTxHash: data.srcTxHash
                }
            }
        );
        if (txData.status === 'completed') {
            return {
                hash: txData.dest_tx_hash,
                status: TX_STATUS.SUCCESS
            };
        }
        return {
            hash: null,
            status: TX_STATUS.PENDING
        };
    }
}
