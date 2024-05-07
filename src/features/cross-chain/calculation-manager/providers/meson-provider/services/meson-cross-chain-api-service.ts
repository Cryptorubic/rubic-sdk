import { NotSupportedTokensError } from 'src/common/errors';
import { TX_STATUS } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Injector } from 'src/core/injector/injector';
import { TxStatusData } from 'src/features/common/status-manager/models/tx-status-data';

import {
    EncodeSwapResponse,
    EncodeSwapSchema,
    FetchEncodedParamRequest,
    MesonLimitsChain,
    MesonLimitsResponse,
    TxFeeResponse,
    TxStatusResponse
} from '../models/meson-api-types';

export class MesonCcrApiService {
    private static apiUrl = 'https://relayer.meson.fi/api/v1';

    public static async fetchMesonFee(
        sourceAssetString: string,
        targetAssetString: string,
        amount: string
    ): Promise<string> {
        const res = await Injector.httpClient.post<TxFeeResponse>(`${this.apiUrl}/price`, {
            from: sourceAssetString,
            to: targetAssetString,
            amount
        });

        if ('error' in res || 'converted' in res.result) {
            throw new NotSupportedTokensError();
        }

        return res.result.totalFee;
    }

    public static async fetchChainsLimits(): Promise<MesonLimitsChain[]> {
        const { result: chains } = await Injector.httpClient.get<MesonLimitsResponse>(
            `${this.apiUrl}/limits`
        );

        return chains;
    }

    public static async fetchInfoForTx(p: FetchEncodedParamRequest): Promise<EncodeSwapSchema> {
        const res = await Injector.httpClient.post<EncodeSwapResponse>(`${this.apiUrl}/swap`, {
            from: p.sourceAssetString,
            to: p.targetAssetString,
            amount: p.amount,
            fromAddress: p.fromAddress,
            fromContract: p.useProxy,
            recipient: p.receiverAddress,
            dataToContract: ''
        });

        if ('error' in res) {
            if ('converted' in res.error) {
                throw new NotSupportedTokensError();
            }
            return res.error;
        } else {
            if ('converted' in res.result) {
                throw new NotSupportedTokensError();
            }
            return res.result;
        }
    }

    /**
     *
     * @param encoded The encoded swap data
     * @param initiator If on proxy - rubic-multiproxy address, if direct - wallet address
     */
    public static async fetchTxStatus(srcTxHash: string): Promise<TxStatusData> {
        const res = await Injector.httpClient.get<TxStatusResponse>(`${this.apiUrl}/swap`, {
            params: {
                hash: srcTxHash
            }
        });

        if ('error' in res || res.result.expired) {
            return {
                hash: null,
                status: TX_STATUS.FAIL
            };
        }

        if (res.result.EXECUTED) {
            return {
                hash: res.result.EXECUTED,
                status: TX_STATUS.SUCCESS
            };
        }

        return {
            hash: null,
            status: TX_STATUS.PENDING
        };
    }
}
