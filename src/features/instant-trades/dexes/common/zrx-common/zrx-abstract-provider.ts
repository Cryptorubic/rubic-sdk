import { InstantTradeProvider } from '@rsdk-features/instant-trades/instant-trade-provider';
import { PriceTokenAmount } from '@rsdk-core/blockchain/tokens/price-token-amount';
import { SwapCalculationOptions } from '@rsdk-features/instant-trades/models/swap-calculation-options';
import { PriceToken } from '@rsdk-core/blockchain/tokens/price-token';
import { createTokenNativeAddressProxy } from '@rsdk-features/instant-trades/dexes/common/utils/token-native-address-proxy';
import { zrxApiParams } from '@rsdk-features/instant-trades/dexes/common/zrx-common/constants';
import { ZrxQuoteRequest } from '@rsdk-features/instant-trades/dexes/common/zrx-common/models/zrx-quote-request';
import { Injector } from '@rsdk-core/sdk/injector';
import { ZrxQuoteResponse } from '@rsdk-features/instant-trades/dexes/common/zrx-common/models/zrx-types';
import { getZrxApiBaseUrl } from '@rsdk-features/instant-trades/dexes/common/zrx-common/utils';
import { ZrxSwapCalculationOptions } from '@rsdk-features/instant-trades/dexes/common/zrx-common/models/zrx-swap-calculation-options';
import BigNumber from 'bignumber.js';
import { ZrxTrade } from '@rsdk-features/instant-trades/dexes/common/zrx-common/zrx-trade';
import { Cache } from 'src/common';
import { EMPTY_ADDRESS } from '@rsdk-core/blockchain/constants/empty-address';

export abstract class ZrxAbstractProvider extends InstantTradeProvider {
    protected readonly gasMargin = 1.4;

    private readonly defaultOptions: Required<ZrxSwapCalculationOptions> = {
        gasCalculation: 'calculate',
        slippageTolerance: 0.02,
        affiliateAddress: null,
        wrappedAddress: EMPTY_ADDRESS,
        fromAddress: ''
    };

    @Cache
    private get apiBaseUrl(): string {
        return getZrxApiBaseUrl(this.blockchain);
    }

    public async calculate(
        from: PriceTokenAmount,
        to: PriceToken,
        options?: SwapCalculationOptions
    ): Promise<ZrxTrade> {
        const fullOptions = { ...this.defaultOptions, options };

        const fromClone = createTokenNativeAddressProxy(from, zrxApiParams.nativeTokenAddress);
        const toClone = createTokenNativeAddressProxy(to, zrxApiParams.nativeTokenAddress);

        const quoteParams: ZrxQuoteRequest = {
            params: {
                sellToken: fromClone.address,
                buyToken: toClone.address,
                sellAmount: fromClone.stringWeiAmount,
                slippagePercentage: fullOptions.slippageTolerance.toString(),
                affiliateAddress: fullOptions.affiliateAddress || undefined
            }
        };

        const apiTradeData = await this.getTradeData(quoteParams);

        const tradeStruct = {
            from,
            to: new PriceTokenAmount({
                ...to.asStruct,
                weiAmount: new BigNumber(apiTradeData.buyAmount)
            }),
            slippageTolerance: fullOptions.slippageTolerance,
            apiTradeData
        };
        if (fullOptions.gasCalculation === 'disabled') {
            return new ZrxTrade(tradeStruct);
        }

        const gasPriceInfo = await this.getGasPriceInfo();
        const gasFeeInfo = await this.getGasFeeInfo(apiTradeData.gas, gasPriceInfo);

        return new ZrxTrade({
            ...tradeStruct,
            gasFeeInfo
        });
    }

    /**
     * Fetches zrx data from api.
     */
    private getTradeData(params: ZrxQuoteRequest): Promise<ZrxQuoteResponse> {
        return Injector.httpClient.get<ZrxQuoteResponse>(`${this.apiBaseUrl}swap/v1/quote`, params);
    }
}
