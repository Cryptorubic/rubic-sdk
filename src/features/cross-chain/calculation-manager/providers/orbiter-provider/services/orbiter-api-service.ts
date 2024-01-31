import { Orbiter } from '@orbiter-finance/bridge-sdk';

import {
    OrbiterQuoteConfig,
    OrbiterQuoteRequestParams,
    OrbiterSwapRequestParams,
    OrbiterTokenSymbols
} from '../models/orbiter-cross-chain-api-service-types';

export class OrbiterApiService {
    /* add in Orbiter constructor {} dealerId to get extra benefits */
    private static readonly orbiterSdk: Orbiter = new Orbiter({});

    public static getQuoteConfigs(): Promise<OrbiterQuoteConfig[]> {
        return OrbiterApiService.orbiterSdk.queryRouters();
    }

    public static async getTokensData(): Promise<OrbiterTokenSymbols> {
        const res = await OrbiterApiService.orbiterSdk.queryTokensAllChain();

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
        return OrbiterApiService.orbiterSdk.queryReceiveAmount(fromAmount, config);
    }

    public static async getSwapTx(params: OrbiterSwapRequestParams): Promise<void> {
        const res = await this.orbiterSdk.toBridge(params);
        console.log(res);
        return;
    }
}
