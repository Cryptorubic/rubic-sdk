import { Injector } from 'src/core/injector/injector';

import { SolanaToken } from '../models/solana-token';

export class SolanaTokensApiService {
    private static readonly apiEndpoint = 'https://x-api.rubic.exchange/sol_token_list';

    private static readonly xApiKey = 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4';

    public static getTokensList(tokenAddresses: string[]): Promise<{ content: SolanaToken[] }> {
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
