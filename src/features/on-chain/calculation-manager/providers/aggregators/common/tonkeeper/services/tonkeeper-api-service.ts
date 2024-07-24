import { NotSupportedTokensError } from 'src/common/errors';
import { Injector } from 'src/core/injector/injector';

import {
    TonkeeperCommonQuoteInfo,
    TonkeeperDexType,
    TonkeeperEncodeSwapParamsResp,
    TonkeeperQuoteResp,
    TonkeeperResp
} from '../models/tonkeeper-api-types';

export class TonkeeperApiService {
    private static apiUrl: string = 'https://rubic-swap.tonkeeper.com/v2';

    public static async makeQuoteReq<T extends TonkeeperCommonQuoteInfo>(
        fromRawAddress: string,
        toRawAddress: string,
        fromAmount: string,
        dexType: TonkeeperDexType
    ): Promise<TonkeeperQuoteResp<T>> {
        const res = await Injector.httpClient.get<TonkeeperResp<TonkeeperQuoteResp<T>>>(
            `${this.apiUrl}/swap/calculate`,
            {
                params: {
                    fromAsset: fromRawAddress,
                    toAsset: toRawAddress,
                    provider: dexType,
                    fromAmount
                }
            }
        );

        if (typeof res === 'string' || !res.trades.length) {
            throw new NotSupportedTokensError();
        }

        return res;
    }

    /**
     * @param slippage number from 0 to 1
     */
    public static async encodeParamsForSwap<T extends TonkeeperCommonQuoteInfo>(
        bestRoute: TonkeeperQuoteResp<T>,
        walletAddress: string,
        slippage: number
    ): Promise<TonkeeperEncodeSwapParamsResp> {
        const key = `${bestRoute.provider}Trade`;
        // @ts-ignore dedustRawTrade or stonfiRawTrade
        const tradeBody = bestRoute.trades[0][`${bestRoute.provider}RawTrade`];
        const res = await Injector.httpClient.post<TonkeeperResp<TonkeeperEncodeSwapParamsResp>>(
            `${this.apiUrl}/swap/encode`,
            {
                swap: {
                    provider: bestRoute.provider,
                    [key]: tradeBody
                },
                options: {
                    senderAddress: walletAddress,
                    slippage: slippage.toString()
                }
            }
        );

        if (typeof res === 'string') {
            throw new NotSupportedTokensError();
        }

        return res;
    }
}
