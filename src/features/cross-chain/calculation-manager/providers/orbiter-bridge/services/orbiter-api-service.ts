import { TX_STATUS } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Injector } from 'src/core/injector/injector';
import { TxStatusData } from 'src/features/common/status-manager/models/tx-status-data';

import { ORBITER_API_ENDPOINT } from '../constants/orbiter-api';
import { ORBITER_OP_STATUS, ORBITER_STATUS } from '../models/orbiter-api-common-types';
import { OrbiterQuoteConfig, OrbiterQuoteConfigsResponse } from '../models/orbiter-api-quote-types';
import {
    OrbiterReceiveAmountResponse,
    OrbiterStatusResponse
} from '../models/orbiter-api-status-types';

export class OrbiterApiService {
    private static dealerId: string | null = null;

    public static async getQuoteConfigs(): Promise<OrbiterQuoteConfig[]> {
        const { result } = await Injector.httpClient.get<OrbiterQuoteConfigsResponse>(
            `${ORBITER_API_ENDPOINT}/routers`,
            { params: { ...(this.dealerId && { dealerId: this.dealerId }) } }
        );

        return result;
    }

    public static async getReceiveAmount(request: {
        line: string;
        value: string;
    }): Promise<OrbiterReceiveAmountResponse> {
        const nonce = Math.round(Math.random() * 10 ** 4).toString();
        return Injector.httpClient.get<OrbiterReceiveAmountResponse>(
            `${ORBITER_API_ENDPOINT}/routers/simulation/receiveAmount`,
            {
                params: {
                    ...request,
                    ...(this.dealerId && { dealerId: this.dealerId }),
                    nonce
                }
            }
        );
    }

    public static async getTxStatus(txHash: string): Promise<TxStatusData> {
        const response = await Injector.httpClient.get<OrbiterStatusResponse>(
            `${ORBITER_API_ENDPOINT}/transaction/status/${txHash}`
        );

        if (!response?.result) {
            return { hash: null, status: TX_STATUS.PENDING };
        }

        const { targetId: hash, status: txStatus, opStatus } = response.result;

        if (txStatus === ORBITER_STATUS.ERROR) {
            return {
                hash,
                status: TX_STATUS.FAIL
            };
        }

        if (txStatus === ORBITER_STATUS.SUCCESS && opStatus === ORBITER_OP_STATUS.SUCCESS_PAYMENT) {
            return {
                hash,
                status: TX_STATUS.SUCCESS
            };
        }

        return { hash, status: TX_STATUS.PENDING };
    }
}
