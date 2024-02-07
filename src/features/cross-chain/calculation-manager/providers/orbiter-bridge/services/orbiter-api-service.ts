import { Orbiter } from '@orbiter-finance/bridge-sdk';
import BigNumber from 'bignumber.js';
import { TX_STATUS } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Injector } from 'src/core/injector/injector';
import { TxStatusData } from 'src/features/common/status-manager/models/tx-status-data';

import { ORBITER_API_ENDPOINT, ORBITER_BASE_FEE } from '../constants/orbiter-api';
import {
    ORBITER_OP_STATUS,
    ORBITER_STATUS,
    OrbiterTokensResponse,
    OrbiterTokenSymbols
} from '../models/orbiter-api-common-types';
import {
    OrbiterGetToAmountParams,
    OrbiterQuoteConfig,
    OrbiterQuoteConfigsResponse
} from '../models/orbiter-api-quote-types';
import { OrbiterStatusResponse } from '../models/orbiter-api-status-types';

export class OrbiterApiService {
    /* add in Orbiter constructor {} dealerId to get extra benefits */
    private static readonly orbiterSdk: Orbiter = new Orbiter({});

    public static async getQuoteConfigs(): Promise<OrbiterQuoteConfig[]> {
        const { result } = await Injector.httpClient.get<OrbiterQuoteConfigsResponse>(
            `${ORBITER_API_ENDPOINT}/routers`,
            { params: { dealerId: undefined! } }
        );

        return result;
    }

    public static async getTokensData(): Promise<OrbiterTokenSymbols> {
        const { result } = await Injector.httpClient.get<OrbiterTokensResponse>(
            `${ORBITER_API_ENDPOINT}/tokens`
        );

        const tokens = Object.entries(result).reduce((acc, [chainId, tokensInChain]) => {
            tokensInChain?.forEach(({ address, symbol }) => {
                acc[chainId] = {} as Record<string, string>;
                acc[chainId]![address] = symbol;
            });

            return acc;
        }, {} as OrbiterTokenSymbols);

        return tokens;
    }

    public static calculateAmount({
        fromAmount,
        config,
        fromDecimals
    }: OrbiterGetToAmountParams): BigNumber {
        const digit = fromDecimals === 18 ? 8 : 5;
        const orbiterFee = fromAmount
            .multipliedBy(config.tradeFee)
            .dividedBy(ORBITER_BASE_FEE)
            .decimalPlaces(digit, BigNumber.ROUND_UP);

        return fromAmount.minus(orbiterFee);
    }

    public static async getTxStatus(txHash: string): Promise<TxStatusData> {
        const {
            result: { targetId: hash, status: txStatus, opStatus }
        } = await Injector.httpClient.get<OrbiterStatusResponse>(
            `${ORBITER_API_ENDPOINT}/transaction/status/${txHash}`
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
