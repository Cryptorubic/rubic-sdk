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
import { TONAPI_API_KEY, TONAPI_API_URL, TONCENTER_API_V3_URL } from '../constants/ton-constants';
import { TonUtils } from './ton-utils';

export class TonApiService {
    /**
     *
     * @param walletAddress in any format: raw or friendly
     */
    public async fetchWalletSeqno(walletAddress: string): Promise<number> {
        const res = await Injector.httpClient.get<TonApiResp<TonApiSeqnoResp>>(
            `${TONAPI_API_URL}/wallet/${walletAddress}/seqno`,
            { headers: { Authorization: TONAPI_API_KEY } }
        );
        if ('error' in res) {
            throw new RubicSdkError(`[TonApiService] Error in fetchWalletSeqno - ${res.error}`);
        }

        return res.seqno;
    }

    public async fetchTxInfo(boc: string): Promise<TonApiTxDataByBocResp> {
        const msgHash = TonUtils.fromBocToBase64Hash(boc);
        const res = await Injector.httpClient.get<TonApiResp<TonApiTxDataByBocResp>>(
            `${TONAPI_API_URL}/blockchain/messages/${msgHash}/transaction`,
            { headers: { Authorization: TONAPI_API_KEY } }
        );
        if ('error' in res) {
            throw new RubicSdkError(`[TonApiService] Error in fetchTxInfo - ${res.error}`);
        }

        return res;
    }

    /**
     *
     * @param type base64 is base64 hash string, boc - string converted from cells returned in tonConnectUI.sendTransactioon
     * @returns
     */
    public async checkIsTxCompleted(hashOrBoc: string, type: 'boc' | 'base64'): Promise<boolean> {
        try {
            const msgHash = type === 'boc' ? TonUtils.fromBocToBase64Hash(hashOrBoc) : hashOrBoc;
            const res = await Injector.httpClient.get<TonApiResp<TonApiStatusByBocResp>>(
                `${TONAPI_API_URL}/events/${msgHash}`,
                { headers: { Authorization: TONAPI_API_KEY } }
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
            `${TONAPI_API_URL}/status`,
            { headers: { Authorization: TONAPI_API_KEY } }
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
            `${TONAPI_API_URL}/blockchain/accounts/${walletAddress}/methods/${methodName}${argsParam}`,
            { headers: { Authorization: TONAPI_API_KEY } }
        );
        if ('error' in res) {
            throw new RubicSdkError(`[TonApiService] Error in callContractMethod - ${res.error}`);
        }

        return res.decoded;
    }

    public async fetchTokenInfo(tokenAddress: string): Promise<TonApiTokenInfoResp['metadata']> {
        const res = await Injector.httpClient.get<TonApiResp<TonApiTokenInfoResp>>(
            `${TONAPI_API_URL}/jettons/${tokenAddress}`,
            { headers: { Authorization: TONAPI_API_KEY } }
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
            `${TONAPI_API_URL}/accounts/${walletAddress}/jettons/${tokenAddress}`,
            { headers: { Authorization: TONAPI_API_KEY } }
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
        >(`${TONAPI_API_URL}/accounts/${walletAddress}/jettons`, {
            headers: { Authorization: TONAPI_API_KEY }
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
            `${TONAPI_API_URL}/accounts/${walletAddress}`,
            { headers: { Authorization: TONAPI_API_KEY } }
        );
        if ('error' in res) {
            throw new RubicSdkError(`[TonApiService] Error in fetchAccountInfo - ${res.error}`);
        }

        return res;
    }
}
