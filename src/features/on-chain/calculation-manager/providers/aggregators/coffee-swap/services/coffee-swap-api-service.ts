import { PriceToken } from 'src/common/tokens';
import { TonBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TonEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/models/ton-types';
import { Injector } from 'src/core/injector/injector';

import {
    CofeeQuoteParams,
    CoffeeQuoteResponse,
    CoffeeRoutePath,
    CoffeeSwapDataResponse
} from '../models/coffe-swap-api-types';

export class CoffeeSwapApiService {
    private static readonly apiUrl = 'https://backend.swap.coffee/v1';

    public static async fetchQuote(params: CofeeQuoteParams): Promise<CoffeeQuoteResponse> {
        try {
            const input_token = this.getCoffeeToken(params.srcToken);
            const output_token = this.getCoffeeToken(params.dstToken);

            const res = await Injector.httpClient.post<CoffeeQuoteResponse>(
                `${this.apiUrl}/route`,
                {
                    input_token,
                    output_token,
                    input_amount: params.srcToken.tokenAmount.toNumber(),
                    max_splits: 3,
                    max_length: 3,
                    pool_selector: {
                        blockchains: ['ton'],
                        // restricts that liquidity wasn't changed more than 30%(with max_volatility 0.3) in last 15 minutes
                        max_volatility: 0.3
                    },
                    additional_data: {
                        sender_address: params.walletAddress,
                        referral_name: 'rubic'
                    }
                }
            );

            return res;
        } catch (err) {
            throw err;
        }
    }

    public static async fetchTonEncodedConfigs(
        walletAddress: string,
        slippage: number,
        paths: CoffeeRoutePath[]
    ): Promise<TonEncodedConfig[]> {
        try {
            const res = await Injector.httpClient.post<CoffeeSwapDataResponse>(
                `${this.apiUrl}/route/transactions`,
                {
                    sender_address: walletAddress,
                    slippage,
                    referral_name: 'rubic',
                    paths
                }
            );
            const tonConfigs = res.transactions.map(tx => ({
                address: tx.address,
                amount: tx.value,
                payload: tx.cell
            })) as TonEncodedConfig[];

            return tonConfigs;
        } catch (err) {
            throw err;
        }
    }

    private static getCoffeeToken(token: PriceToken<TonBlockchainName>): {
        blockchain: 'ton';
        address: string;
    } {
        return { blockchain: 'ton', address: token.isNative ? 'native' : token.address };
    }
}
