import { NotSupportedTokensError, RubicSdkError } from 'src/common/errors';
import { TX_STATUS } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Injector } from 'src/core/injector/injector';
import { TxStatusData } from 'src/features/common/status-manager/models/tx-status-data';

import {
    EncodeSwapSchema,
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
            const res = this.parseMesonError<TxFeeSchema>(e);

            return res.totalFee;
        }
    }

    public static async fetchChainsLimits(): Promise<MesonLimitsChain[]> {
        const { result: chains } = await Injector.httpClient.get<MesonLimitsResponse>(
            `${this.apiUrl}/limits`
        );

        return chains;
    }

    public static async fetchInfoForTx(p: FetchEncodedParamRequest): Promise<EncodeSwapSchema> {
        try {
            const res = await Injector.httpClient.post<MesonSuccessRes<EncodeSwapSchema>>(
                `${this.apiUrl}/swap`,
                {
                    from: p.sourceAssetString,
                    to: p.targetAssetString,
                    amount: p.amount,
                    fromAddress: p.fromAddress,
                    fromContract: p.useProxy,
                    recipient: p.receiverAddress
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

    /**
     *
     * @param encoded The encoded swap data
     * @param initiator If on proxy - rubic-multiproxy address, if direct - wallet address
     */
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
                error: {
                    data: { swapData }
                }
            }
        } = err as MesonErrorRes<T>;

        if ('converted' in swapData) {
            throw new NotSupportedTokensError();
        }

        return swapData;
    }
}
