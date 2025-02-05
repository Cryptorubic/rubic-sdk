import { NotSupportedTokensError, RubicSdkError } from 'src/common/errors';
import { TX_STATUS } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Injector } from 'src/core/injector/injector';
import { TxStatusData } from 'src/features/common/status-manager/models/tx-status-data';

import {
    EncodeSwapSchema,
    ErrorFeeResp,
    FetchEncodedParamRequest,
    MesonErrorRes,
    MesonLimitsChain,
    MesonLimitsResponse,
    MesonSuccessRes,
    TxFeeSchema,
    TxStatusSchema
} from '../models/meson-api-types';

export class MesonCcrApiService {
    private static apiUrl = 'https://relayer.meson.fi/api/v1';

    public static async fetchMesonFee(
        sourceAssetString: string,
        targetAssetString: string,
        amount: string
    ): Promise<string> {
        try {
            const res = await Injector.httpClient.post<MesonSuccessRes<TxFeeSchema>>(
                `${this.apiUrl}/price`,
                {
                    from: sourceAssetString,
                    to: targetAssetString,
                    amount
                }
            );

            if ('converted' in res.result) {
                throw new RubicSdkError('converted');
            }

            return res.result.totalFee;
        } catch (e: unknown) {
            const res = this.parseMesonError<ErrorFeeResp>(e);

            if (!res?.fee) {
                throw e;
            }

            return res.fee;
        }
    }

    public static async fetchChainsLimits(): Promise<MesonLimitsChain[]> {
        const { result: chains } = await Injector.httpClient.get<MesonLimitsResponse>(
            `${this.apiUrl}/limits`
        );

        return chains;
    }

    public static async fetchInfoForTx(
        params: FetchEncodedParamRequest
    ): Promise<EncodeSwapSchema> {
        try {
            const res = await Injector.httpClient.post<MesonSuccessRes<EncodeSwapSchema>>(
                `${this.apiUrl}/swap`,
                {
                    from: params.sourceAssetString,
                    to: params.targetAssetString,
                    amount: params.amount,
                    fromAddress: params.fromAddress,
                    fromContract: params.useProxy,
                    recipient: params.receiverAddress
                }
            );

            if ('converted' in res.result) {
                throw new RubicSdkError('converted');
            }

            return res.result;
        } catch (e: unknown) {
            const res = this.parseMesonError<EncodeSwapSchema>(e);

            return res;
        }
    }

    public static async fetchTxStatus(srcTxHash: string): Promise<TxStatusData> {
        try {
            const res = await Injector.httpClient.get<MesonSuccessRes<TxStatusSchema>>(
                `${this.apiUrl}/swap`,
                {
                    params: {
                        hash: srcTxHash
                    }
                }
            );

            if (res.result.expired) {
                return {
                    hash: null,
                    status: TX_STATUS.FAIL
                };
            }

            if (res.result.RELEASED) {
                return {
                    hash: res.result.RELEASED,
                    status: TX_STATUS.SUCCESS,
                    extraInfo: {
                        mesonSwapId: res.result.swap.id
                    }
                };
            }

            return {
                hash: null,
                status: TX_STATUS.PENDING
            };
        } catch {
            return {
                hash: null,
                status: TX_STATUS.PENDING
            };
        }
    }

    private static parseMesonError<T extends object>(err: unknown): T {
        if ((err as RubicSdkError).message?.includes('converted')) {
            throw new NotSupportedTokensError();
        }

        const {
            error: {
                error: { data }
            }
        } = err as MesonErrorRes<T>;

        if (!data || 'converted' in data) throw new NotSupportedTokensError();

        return data;
    }
}
