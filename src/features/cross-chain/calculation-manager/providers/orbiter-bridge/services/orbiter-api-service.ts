import { Orbiter } from '@orbiter-finance/bridge-sdk';
import { RubicSdkError } from 'src/common/errors';
import { TX_STATUS } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Injector } from 'src/core/injector/injector';
import { TxStatusData } from 'src/features/common/status-manager/models/tx-status-data';

import { orbiterApiEndpoint } from '../constants/orbiter-api';
import {
    ORBITER_OP_STATUS,
    ORBITER_STATUS,
    OrbiterQuoteConfig,
    OrbiterQuoteRequestParams,
    OrbiterStatusResponse,
    OrbiterSwapRequestParams,
    OrbiterSwapResponse,
    OrbiterTokenSymbols
} from '../models/orbiter-bridge-api-service-types';

export class OrbiterApiService {
    /* add in Orbiter constructor {} dealerId to get extra benefits */
    private static readonly orbiterSdk: Orbiter = new Orbiter({});

    public static getQuoteConfigs(): Promise<OrbiterQuoteConfig[]> {
        return this.orbiterSdk.queryRouters();
    }

    public static async getTokensData(): Promise<OrbiterTokenSymbols> {
        const res = await this.orbiterSdk.queryTokensAllChain();

        const tokens = Object.entries(res).reduce((acc, [chainId, tokensInChain]) => {
            tokensInChain?.forEach(({ address, symbol }) => {
                acc[chainId] = {} as Record<string, string>;
                acc[chainId]![address] = symbol;
            });

            return acc;
        }, {} as OrbiterTokenSymbols);

        return tokens;
    }

    public static async getQuoteTx({
        fromAmount,
        config
    }: OrbiterQuoteRequestParams): Promise<string> {
        const amount = await this.orbiterSdk.queryReceiveAmount(fromAmount, config);

        if (amount === 0) {
            throw new RubicSdkError('Unsupported token pair.');
        }

        return amount;
    }

    public static async getSwapTx(params: OrbiterSwapRequestParams): Promise<OrbiterSwapResponse> {
        const res = (await this.orbiterSdk.toBridge(params)) as OrbiterSwapResponse;
        return res;
    }

    public static async getTxStatus(txHash: string): Promise<TxStatusData> {
        const {
            result: { targetId: hash, status: txStatus, opStatus }
        } = await Injector.httpClient.get<OrbiterStatusResponse>(
            `${orbiterApiEndpoint}/transaction/status/${txHash}`
        );

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
