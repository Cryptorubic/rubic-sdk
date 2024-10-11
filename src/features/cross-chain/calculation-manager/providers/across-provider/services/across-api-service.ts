import { TX_STATUS } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Injector } from 'src/core/injector/injector';
import { TxStatusData } from 'src/features/common/status-manager/models/tx-status-data';

import { AcrossFeeQuoteRequestParams, AcrossFeeQuoteResponse } from '../models/across-fee-quote';
import { AcrossTxStatus } from '../models/across-tx-status';

export class AcrossApiService {
    private static endpoint = 'https://app.across.to/api';

    public static async getFeeQuote(
        params: AcrossFeeQuoteRequestParams
    ): Promise<AcrossFeeQuoteResponse> {
        return Injector.httpClient.get<AcrossFeeQuoteResponse>(
            `${AcrossApiService.endpoint}/suggested-fees`,
            {
                params: {
                    ...params
                }
            }
        );
    }

    public static async getTxStatus(
        originChainId: number,
        depositId: number
    ): Promise<TxStatusData> {
        const data = await Injector.httpClient.get<AcrossTxStatus>(
            `${AcrossApiService.endpoint}/deposit/status`,
            {
                params: {
                    originChainId,
                    depositId
                }
            }
        );

        if (data.status === 'filled' && data?.fillTx) {
            return {
                hash: data.fillTx,
                status: TX_STATUS.SUCCESS
            };
        }

        if (data.status === 'expired') {
            return {
                hash: null,
                status: TX_STATUS.REVERT
            };
        }

        return {
            hash: null,
            status: TX_STATUS.PENDING
        };
    }
}
