import { Orbiter } from '@orbiter-finance/bridge-sdk';

import {
    OrbiterQuoteConfig,
    OrbiterQuoteRequestParams,
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

    public static getQuoteTx({
        fromAmount,
        config
    }: OrbiterQuoteRequestParams): Promise<string | 0> {
        return this.orbiterSdk.queryReceiveAmount(fromAmount, config);
    }

    public static async getSwapTx(params: OrbiterSwapRequestParams): Promise<OrbiterSwapResponse> {
        const res = (await this.orbiterSdk.toBridge(params)) as OrbiterSwapResponse;
        return res;
    }
}
