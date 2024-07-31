import { Injector } from 'src/core/injector/injector';

import {
    RetroBridgeQuoteResponse,
    RetroBridgeQuoteSendParams
} from '../models/retro-bridge-quote-send-params';

export class RetroBridgeApiService {
    private static readonly RETRO_BRIDGE_API_ENDPOINT = 'https://backend.retrobridge.io/api';

    public static async getTokenLimits(
        fromBlockchain: string,
        toBlockchain: string,
        fromToken: string,
        toToken: string
    ): Promise<{ min_send: number; max_send: number }> {
        const { data } = await Injector.httpClient.get<{
            data: {
                min_send: number;
                max_send: number;
            };
        }>(`${this.RETRO_BRIDGE_API_ENDPOINT}/bridge/limits`, {
            params: {
                source_chain: fromBlockchain,
                destination_chain: toBlockchain,
                asset_from: fromToken,
                asset_to: toToken
            }
        });
        return data;
    }

    public static async getQuote(
        params: RetroBridgeQuoteSendParams
    ): Promise<RetroBridgeQuoteResponse> {
        const { data } = await Injector.httpClient.get<{ data: RetroBridgeQuoteResponse }>(
            `${this.RETRO_BRIDGE_API_ENDPOINT}/bridge/quote`,
            {
                params: {
                    ...params
                }
            }
        );
        return data;
    }
}
