import { Injector } from 'src/core/injector/injector';

import {
    RetroBridgeQuoteResponse,
    RetroBridgeQuoteSendParams,
    RetroBridgeTxResponse,
    RetroBridgeTxSendParams
} from '../models/retro-bridge-quote-send-params';

interface SignMessage {
    message: {
        value: string;
    };
}
export class RetroBridgeApiService {
    private static readonly RETRO_BRIDGE_API_ENDPOINT = 'https://backend.retrobridge.io/api';

    private static readonly API_KEY = ' ';

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

    public static async getMessageToAuthWallet(): Promise<string> {
        const { data } = await Injector.httpClient.get<{ data: SignMessage }>(
            `${this.RETRO_BRIDGE_API_ENDPOINT}/wallet_auth/message`
        );
        return data.message.value;
    }

    public static async sendSignedMessage(
        walletAddress: string,
        signature: string,
        networkType: string
    ): Promise<string> {
        const { data } = await Injector.httpClient.post<{
            data: {
                network_type: string;
                token: string;
            };
        }>(`${this.RETRO_BRIDGE_API_ENDPOINT}/wallet_auth/message`, {
            wallet_address: walletAddress,
            network_type: networkType,
            signature
        });

        return `${data.network_type}=${data.token}`;
    }

    public static async checkWallet(
        walletAddress: string,
        networkType: string,
        walletCookie: string
    ): Promise<string> {
        const { message } = await Injector.httpClient.get<{ message: string }>(
            `${this.RETRO_BRIDGE_API_ENDPOINT}/wallet_auth/wallet/${walletAddress}`,
            {
                headers: {
                    'network-type': networkType,
                    Сookie: walletCookie
                }
            }
        );
        return message;
    }

    public static async createTransaction(
        params: RetroBridgeTxSendParams,
        networkType: string,
        walletCookie: string
    ): Promise<RetroBridgeTxResponse> {
        const { data } = await Injector.httpClient.post<{ data: RetroBridgeTxResponse }>(
            `${this.RETRO_BRIDGE_API_ENDPOINT}/bridge/execute`,
            params,
            {
                headers: {
                    'api-key': this.API_KEY,
                    'network-type': networkType,
                    Сookie: walletCookie
                }
            }
        );
        return data;
    }
}
