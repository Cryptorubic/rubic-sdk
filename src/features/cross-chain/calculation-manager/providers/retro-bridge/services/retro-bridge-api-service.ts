import { TX_STATUS } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Injector } from 'src/core/injector/injector';
import { TxStatusData } from 'src/features/common/status-manager/models/tx-status-data';

import {
    RetroBridgeQuoteResponse,
    RetroBridgeQuoteSendParams,
    RetroBridgeTxResponse,
    RetroBridgeTxSendParams
} from '../models/retro-bridge-quote-send-params';
import { RetroBridgeToken } from '../models/retro-bridge-token';
import {
    RETRO_BRIDGE_TX_STATUS,
    RetroBridgeStatusResponse
} from '../models/retro-bridge-tx-status';

interface SignMessage {
    message: {
        value: string;
    };
}
export class RetroBridgeApiService {
    private static readonly RETRO_BRIDGE_API_ENDPOINT = 'https://backend.retrobridge.io/api';

    private static API_KEY = 'rubic';

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
    ): Promise<never | void> {
        try {
            await Injector.httpClient.post(
                `${this.RETRO_BRIDGE_API_ENDPOINT}/wallet_auth/message`,
                {
                    wallet_address: walletAddress,
                    network_type: networkType,
                    signature
                },
                {
                    withCredentials: true
                }
            );
        } catch (err) {
            console.error(err);
        }
    }

    public static async checkWallet(walletAddress: string, networkType: string): Promise<string> {
        const { message } = await Injector.httpClient.get<{ message: string }>(
            `${this.RETRO_BRIDGE_API_ENDPOINT}/wallet_auth/wallet/${walletAddress}`,
            {
                headers: {
                    'network-type': networkType
                },
                withCredentials: true
            }
        );
        return message;
    }

    public static async createTransaction(
        params: RetroBridgeTxSendParams,
        networkType: string
    ): Promise<RetroBridgeTxResponse> {
        const { data } = await Injector.httpClient.post<{ data: RetroBridgeTxResponse }>(
            `${this.RETRO_BRIDGE_API_ENDPOINT}/bridge/execute`,
            params,
            {
                headers: {
                    'network-type': networkType,
                    'api-key': this.API_KEY
                },
                withCredentials: true
            }
        );
        return data;
    }

    public static async getTxStatus(transactionId: string): Promise<TxStatusData> {
        const { data } = await Injector.httpClient.get<RetroBridgeStatusResponse>(
            `${this.RETRO_BRIDGE_API_ENDPOINT}/bridge/${transactionId}/info`
        );
        const txStatus = data.status.toLowerCase();

        if (txStatus === RETRO_BRIDGE_TX_STATUS.COMPLETED) {
            return {
                hash: data.destination_tx_hash,
                status: TX_STATUS.SUCCESS
            };
        }
        if (
            txStatus === RETRO_BRIDGE_TX_STATUS.SEND_FAILED ||
            txStatus === RETRO_BRIDGE_TX_STATUS.REJECTED
        ) {
            return {
                hash: data.source_tx_hash,
                status: TX_STATUS.FAIL
            };
        }
        return {
            hash: null,
            status: TX_STATUS.PENDING
        };
    }

    public static getTokenList(
        srcChain: string,
        dstChain: string
    ): Promise<{ data: RetroBridgeToken[] }> {
        return Injector.httpClient.get(
            `${this.RETRO_BRIDGE_API_ENDPOINT}/assets/?source_chain=${srcChain}&destination_chain=${dstChain}`,
            {
                headers: {
                    'api-key': this.API_KEY
                }
            }
        );
    }
}
