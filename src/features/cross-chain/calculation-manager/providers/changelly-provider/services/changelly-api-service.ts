import { Injector } from 'src/core/injector/injector';

import {
    CROSS_CHAIN_DEPOSIT_STATUS,
    CrossChainDepositData
} from '../../common/cross-chain-transfer-trade/models/cross-chain-deposit-statuses';
import {
    ChangellyEstimateResponse,
    ChangellyExchangeResponse
} from '../models/changelly-estimate-response';
import { ChangellyExchangeSendParams } from '../models/changelly-exchange-send-params';
import { ChangellyExchangeStatusResponse } from '../models/changelly-exchange-status';
import { ChangellyLimitError } from '../models/changelly-limit-error';
import { ChangellyToken } from '../models/changelly-token';

export class ChangellyApiService {
    private static xApiKey = 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4';

    private static endpoint = 'https://x-api.rubic.exchange/changelly';

    public static fetchTokenList(): Promise<{ result: ChangellyToken[] }> {
        return Injector.httpClient.post(
            `${ChangellyApiService.endpoint}?method=getCurrenciesFull`,
            {
                params: {}
            },
            {
                headers: {
                    apiKey: ChangellyApiService.xApiKey
                }
            }
        );
    }

    public static getFixedRateEstimation(params: {
        from: string;
        to: string;
        amountFrom: string;
        amountTo?: string;
    }): Promise<{ result: ChangellyEstimateResponse[]; error?: ChangellyLimitError }> {
        return Injector.httpClient.post(
            `${ChangellyApiService.endpoint}?method=getFixRateForAmount`,
            {
                params
            },
            {
                headers: {
                    apiKey: ChangellyApiService.xApiKey
                }
            }
        );
    }

    public static createExchange(
        params: ChangellyExchangeSendParams
    ): Promise<{ result: ChangellyExchangeResponse }> {
        return Injector.httpClient.post(
            `${ChangellyApiService.endpoint}?method=createFixTransaction`,
            {
                params
            },
            {
                headers: {
                    apiKey: ChangellyApiService.xApiKey
                }
            }
        );
    }

    public static async getTxStatus(id: string): Promise<CrossChainDepositData> {
        const { result } = await Injector.httpClient.post<{
            result: ChangellyExchangeStatusResponse[];
        }>(
            `${ChangellyApiService.endpoint}?method=getTransactions`,
            {
                params: {
                    id
                }
            },
            {
                headers: {
                    apiKey: ChangellyApiService.xApiKey
                }
            }
        );

        const txData = result[0]!;

        if (
            txData.status === 'overdue' ||
            txData.status === 'expired' ||
            txData.status === 'failed'
        ) {
            return {
                status: CROSS_CHAIN_DEPOSIT_STATUS.FAILED,
                dstHash: null
            };
        }

        if (txData.status === 'new' || txData.status === 'waiting') {
            return {
                status: CROSS_CHAIN_DEPOSIT_STATUS.WAITING,
                dstHash: null
            };
        }

        const depositData: CrossChainDepositData = {
            status: txData.status,
            dstHash: txData.payoutHash ? txData.payoutHash : null
        };

        return depositData;
    }
}
