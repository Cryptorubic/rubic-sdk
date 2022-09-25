import { InstantTradeProvider } from 'src/features/instant-trades/providers/dexes/abstract/instant-trade-provider/instant-trade-provider';
import { CalculationOptions } from 'src/features/instant-trades/providers/models/calculation-options';
import { createTokenNativeAddressProxy } from 'src/features/instant-trades/providers/dexes/abstract/utils/token-native-address-proxy';
import { zrxApiParams } from 'src/features/instant-trades/providers/dexes/abstract/zrx-abstract/constants';
import { ZrxQuoteRequest } from 'src/features/instant-trades/providers/dexes/abstract/zrx-abstract/models/zrx-quote-request';
import { ZrxQuoteResponse } from 'src/features/instant-trades/providers/dexes/abstract/zrx-abstract/models/zrx-types';
import { getZrxApiBaseUrl } from 'src/features/instant-trades/providers/dexes/abstract/zrx-abstract/utils';
import BigNumber from 'bignumber.js';
import { ZrxTrade } from 'src/features/instant-trades/providers/dexes/abstract/zrx-abstract/zrx-trade';
import { combineOptions } from 'src/common/utils/options';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TRADE_TYPE, TradeType } from 'src/features/instant-trades/providers/models/trade-type';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { Cache } from 'src/common/utils/decorators';
import { ZrxCalculationOptions } from 'src/features/instant-trades/providers/dexes/abstract/zrx-abstract/models/zrx-calculation-options';

export abstract class ZrxAbstractProvider extends InstantTradeProvider {
    protected readonly gasMargin = 1.4;

    private readonly defaultOptions: ZrxCalculationOptions = {
        slippageTolerance: 0.02,
        gasCalculation: 'calculate'
    };

    public get type(): TradeType {
        return TRADE_TYPE.ZRX;
    }

    @Cache
    private get apiBaseUrl(): string {
        return getZrxApiBaseUrl(this.blockchain);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceToken<EvmBlockchainName>,
        options?: CalculationOptions
    ): Promise<ZrxTrade> {
        const fullOptions = combineOptions(options, this.defaultOptions);

        const fromClone = createTokenNativeAddressProxy(from, zrxApiParams.nativeTokenAddress);
        const toClone = createTokenNativeAddressProxy(to, zrxApiParams.nativeTokenAddress);

        const affiliateAddress = fullOptions.zrxAffiliateAddress;
        const quoteParams: ZrxQuoteRequest = {
            params: {
                sellToken: fromClone.address,
                buyToken: toClone.address,
                sellAmount: fromClone.stringWeiAmount,
                slippagePercentage: fullOptions.slippageTolerance.toString(),
                ...(affiliateAddress && { affiliateAddress })
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
            apiTradeData,
            path: [from, to]
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
        return this.httpClient.get<ZrxQuoteResponse>(`${this.apiBaseUrl}swap/v1/quote`, params);
    }
}
