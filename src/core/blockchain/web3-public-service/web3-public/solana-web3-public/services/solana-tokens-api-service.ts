import { compareAddresses } from 'src/common/utils/blockchain';
import { Injector } from 'src/core/injector/injector';

import { SolanaToken } from '../models/solana-token';

interface TokenList {
    preparedTokens: SolanaToken[];
    addresses: string[];
}

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

    public static prepareTokens(tokenAddresses: string[]): TokenList {
        const preparedTokens = [
            {
                name: 'Happy Cat',
                symbol: 'HAPPY',
                logoURI: null,
                address: 'HAPPYwgFcjEJDzRtfWE6tiHE9zGdzpNky2FvjPHsvvGZ',
                decimals: 9
            },
            {
                name: 'Just a chill guy',
                symbol: 'CHILLGUY',
                logoURI: 'https://ipfs.io/ipfs/Qmckb3nWWHyoJKtX3FeagfmDZXNVqiXM4nKkYsTnygm2Ah',
                address: 'Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump',
                decimals: 6
            }
        ];
        return tokenAddresses.reduce(
            (list, address) => {
                const existedToken = preparedTokens.find(token =>
                    compareAddresses(token.address, address)
                );
                return existedToken
                    ? {
                          preparedTokens: [...list.preparedTokens, existedToken],
                          addresses: list.addresses
                      }
                    : {
                          preparedTokens: list.preparedTokens,
                          addresses: [...list.addresses, address]
                      };
            },
            { preparedTokens: [], addresses: [] } as TokenList
        );
    }
}
