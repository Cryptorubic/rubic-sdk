import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { Injector } from 'src/core/injector/injector';

import { BOUNCEABLE_TON_NATIVE_ADDRESS, STONFI_REFERRAL_ADDRESS } from '../constants/addresses';
import { StonfiQuoteInfo, StonfiQuoteResponse } from '../models/stonfi-api-types';

export class StonfiApiService {
    private static readonly apiUrl = 'https://api.ston.fi/v1';

    public static async makeQuoteRequest(
        from: PriceTokenAmount,
        to: PriceToken,
        slippage: number
    ): Promise<StonfiQuoteInfo> {
        try {
            const srcTokenAddress = from.isNative ? BOUNCEABLE_TON_NATIVE_ADDRESS : from.address;
            const dstTokenAddress = to.isNative ? BOUNCEABLE_TON_NATIVE_ADDRESS : to.address;
            // @TODO Add dex_v2=true after stonfi-sdk update
            const queryParams = `offer_address=${srcTokenAddress}
&ask_address=${dstTokenAddress}
&units=${from.stringWeiAmount}
&slippage_tolerance=${slippage}
&referral_fee_bps=100
&referral_address=${STONFI_REFERRAL_ADDRESS}&dex_v2=false`;

            const res = await Injector.httpClient.post<StonfiQuoteResponse>(
                `${this.apiUrl}/swap/simulate?${queryParams}`
            );

            return {
                minAmountOutWei: res.min_ask_units,
                amountOutWei: res.ask_units,
                stonfiFee: res.fee_units
            };
        } catch (err) {
            throw err;
        }
    }
}
