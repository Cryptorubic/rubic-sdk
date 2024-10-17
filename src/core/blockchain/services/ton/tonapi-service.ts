import { RubicSdkError } from 'src/common/errors';
import { Injector } from 'src/core/injector/injector';

import {
    TonCenterBlockInfo,
    TonCenterBlocksResp,
    TonCenterResp
} from '../../models/ton/ton-center-types';
import {
    TonApiAccountInfoResp,
    TonApiAllNonNullableTokenInfoForWalletResp,
    TonApiCallContractCommonResp,
    TonApiHealthcheckResp,
    TonApiResp,
    TonApiSeqnoResp,
    TonApiStatusByBocResp,
    TonApiTokenInfoForWalletResp,
    TonApiTokenInfoResp,
    TonApiTxDataByBocResp
} from '../../models/ton/tonapi-types';
import { Web3PrimitiveType } from '../../models/web3-primitive-type';
import { TONCENTER_API_V3_URL } from '../constants/ton-constants';

export class TonApiService {
    private readonly xApiUrl = 'https://x-api.rubic.exchange/tonapi';

    private readonly xApiKey = 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4';

    /**
     *
     * @param walletAddress in any format: raw or friendly
     */
    public async fetchWalletSeqno(walletAddress: string): Promise<number> {
        const res = await Injector.httpClient.get<TonApiResp<TonApiSeqnoResp>>(
            `${this.xApiUrl}/v2/wallet/${walletAddress}/seqno`,
            { headers: { apikey: this.xApiKey } }
        );
        if ('error' in res) {
            throw new RubicSdkError(`[TonApiService] Error in fetchWalletSeqno - ${res.error}`);
        }

        return res.seqno;
    }

    public async fetchTxInfo(txHash: string): Promise<TonApiTxDataByBocResp> {
        const res = await Injector.httpClient.get<TonApiResp<TonApiTxDataByBocResp>>(
            `${this.xApiUrl}/v2/blockchain/messages/${txHash}/transaction`,
            { headers: { apikey: this.xApiKey } }
        );
        if ('error' in res) {
            throw new RubicSdkError(`[TonApiService] Error in fetchTxInfo - ${res.error}`);
        }

        return res;
    }

    public async checkIsTxCompleted(txHash: string): Promise<boolean> {
        try {
            const res = await Injector.httpClient.get<TonApiResp<TonApiStatusByBocResp>>(
                `${this.xApiUrl}/v2/events/${txHash}`,
                { headers: { apikey: this.xApiKey } }
            );
            if ('error' in res) {
                throw new RubicSdkError(
                    `[TonApiService] Error in checkIsTxCompleted - ${res.error}`
                );
            }

            return Object.hasOwn(res, 'in_progress') && !res.in_progress;
        } catch {
            return false;
        }
    }

    public async healthcheck(): Promise<boolean> {
        const res = await Injector.httpClient.get<TonApiResp<TonApiHealthcheckResp>>(
            `${this.xApiUrl}/v2/status`,
            { headers: { apikey: this.xApiKey } }
        );
        if ('error' in res || !res.rest_online) {
            return false;
        }
        return true;
    }

    public async fetchLastBlockInfo(): Promise<TonCenterBlockInfo> {
        const res = await Injector.httpClient.get<TonCenterResp<TonCenterBlocksResp>>(
            `${TONCENTER_API_V3_URL}/blocks`,
            {
                params: {
                    sort: 'desc',
                    limit: 1,
                    offset: 0
                }
            }
        );
        if ('detail' in res) {
            throw new RubicSdkError(
                `[TonApiService] Error in fetchWalletSeqno - ${res.detail[0]?.msg}`
            );
        }

        return res.blocks[0]!;
    }

    /**
     *
     * @param walletAddress in any format: raw or friendly
     */
    public async callContractMethod<T>(
        walletAddress: string,
        methodName: string,
        methodArgs: Web3PrimitiveType[]
    ): Promise<T> {
        let argsParam = '';
        if (methodArgs.length) {
            argsParam += '?' + methodArgs.map(param => `args=${param}`).join('&');
        }
        const res = await Injector.httpClient.get<TonApiResp<TonApiCallContractCommonResp<T>>>(
            `${this.xApiUrl}/v2/blockchain/accounts/${walletAddress}/methods/${methodName}${argsParam}`,
            { headers: { apikey: this.xApiKey } }
        );
        if ('error' in res) {
            throw new RubicSdkError(`[TonApiService] Error in callContractMethod - ${res.error}`);
        }

        return res.decoded;
    }

    public async fetchTokenInfo(tokenAddress: string): Promise<TonApiTokenInfoResp['metadata']> {
        const res = await Injector.httpClient.get<TonApiResp<TonApiTokenInfoResp>>(
            `${this.xApiUrl}/v2/jettons/${tokenAddress}`,
            { headers: { apikey: this.xApiKey } }
        );
        if ('error' in res) {
            throw new RubicSdkError(`[TonApiService] Error in fetchTokenInfo - ${res.error}`);
        }

        return res.metadata;
    }

    /**
     *
     * @param tokenAddress in any form: raw or friendly
     * @returns balance, decimals, name, symbol, walletJettonAddress, jettonAddress
     */
    public async fetchTokenInfoForWallet(
        walletAddress: string,
        tokenAddress: string
    ): Promise<TonApiTokenInfoForWalletResp> {
        const res = await Injector.httpClient.get<TonApiResp<TonApiTokenInfoForWalletResp>>(
            `${this.xApiUrl}/v2/accounts/${walletAddress}/jettons/${tokenAddress}`,
            { headers: { apikey: this.xApiKey } }
        );
        if ('error' in res) {
            throw new RubicSdkError(
                `[TonApiService] Error in fetchTokenInfoForWallet - ${res.error}`
            );
        }

        return res;
    }

    public async fetchAllNonNullableTokensInfoForWallet(
        walletAddress: string
    ): Promise<TonApiAllNonNullableTokenInfoForWalletResp['balances']> {
        const res = await Injector.httpClient.get<
            TonApiResp<TonApiAllNonNullableTokenInfoForWalletResp>
        >(`${this.xApiUrl}/v2/accounts/${walletAddress}/jettons`, {
            headers: { apikey: this.xApiKey }
        });
        if ('error' in res) {
            throw new RubicSdkError(
                `[TonApiService] Error in fetchAllNonNullableTokensInfoForWallet - ${res.error}`
            );
        }

        return res.balances;
    }

    /**
     * @returns available methods for walletAddress(contract), raw address and native coin TON balance
     */
    public async fetchAccountInfo(walletAddress: string): Promise<TonApiAccountInfoResp> {
        const res = await Injector.httpClient.get<TonApiResp<TonApiAccountInfoResp>>(
            `${this.xApiUrl}/v2/accounts/${walletAddress}`,
            { headers: { apikey: this.xApiKey } }
        );
        if ('error' in res) {
            throw new RubicSdkError(`[TonApiService] Error in fetchAccountInfo - ${res.error}`);
        }

        return res;
    }
}
