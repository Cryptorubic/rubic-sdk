import { Injector } from 'src/core/injector/injector';
import { HttpClientParams } from 'src/features/common/providers/rango/models/rango-api-common-types';

import { ApiV2TokensResp, SolanaToken } from '../models/solana-token';

export class SolanaTokensApiService {
    private static readonly apiEndpoint = 'https://x-api.rubic.exchange/sol_token_list';

    private static readonly newTokensEndpoint = 'https://api.rubic.exchange/api/v2';

    private static readonly xApiKey = 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4';

    public static async getTokensList(tokenAddresses: string[]): Promise<SolanaToken[]> {
        try {
            const queryParams =
                tokenAddresses.length > 1
                    ? { addresses: tokenAddresses.join(',') }
                    : { query: tokenAddresses[0] };

            const resp = await Injector.httpClient.get<ApiV2TokensResp>(
                `${this.newTokensEndpoint}/tokens/`,
                {
                    params: queryParams as unknown as HttpClientParams
                }
            );

            return resp.results.map(t => ({
                address: t.address,
                decimals: t.decimals,
                logoURI: t.image,
                name: t.name,
                symbol: t.symbol
            })) as SolanaToken[];
        } catch {
            return [];
        }
    }

    public static getTokensListOld(tokenAddresses: string[]): Promise<{ content: SolanaToken[] }> {
        return Injector.httpClient.post(
            `${this.apiEndpoint}/v1/mints?chainId=101`,
            { addresses: tokenAddresses },
            {
                headers: {
                    apiKey: this.xApiKey
                }
            }
        );
    }
}
