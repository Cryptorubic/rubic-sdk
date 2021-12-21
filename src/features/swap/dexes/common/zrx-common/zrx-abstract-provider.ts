import { GasPriceApi } from '@common/http/gas-price-api';
import { InstantTradeProvider } from '@features/swap/instant-trade-provider';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { SwapCalculationOptions } from '@features/swap/models/swap-calculation-options';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { createTokenNativeAddressProxy } from '@features/swap/dexes/common/utils/token-native-address-proxy';
import { zrxApiParams } from '@features/swap/dexes/common/zrx-common/constants';
import { ZrxQuoteRequest } from '@features/swap/dexes/common/zrx-common/models/zrx-quote-request';
import { Injector } from '@core/sdk/injector';
import { ZrxQuoteResponse } from '@features/swap/dexes/common/zrx-common/models/zrx-types';
import { Pure } from '@common/decorators/pure.decorator';
import { getZrxApiBaseUrl } from '@features/swap/dexes/common/zrx-common/utils';
import { ZrxSwapCalculationOptions } from '@features/swap/dexes/common/zrx-common/models/zrx-swap-calculation-options';
import BigNumber from 'bignumber.js';
import { ZrxTrade } from '@features/swap/dexes/common/zrx-common/zrx-trade';

export abstract class ZrxAbstractProvider extends InstantTradeProvider {
    protected readonly gasMargin = 1.4;

    private readonly defaultOptions: Required<ZrxSwapCalculationOptions> = {
        gasCalculation: 'calculate',
        slippageTolerance: 0.02,
        affiliateAddress: null
    };

    @Pure
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
                tokenAmount: new BigNumber(apiTradeData.buyAmount)
            }),
            slippageTolerance: fullOptions.slippageTolerance,
            apiTradeData
        };
        if (
            fullOptions.gasCalculation === 'disabled' ||
            !GasPriceApi.isSupportedBlockchain(from.blockchain)
        ) {
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
