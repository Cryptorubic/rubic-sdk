import { InstantTradeProvider } from '../../../instant-trade-provider';
import { PriceTokenAmount } from '../../../../../core/blockchain/tokens/price-token-amount';
import { SwapCalculationOptions } from '../../../models/swap-calculation-options';
import { PriceToken } from '../../../../../core/blockchain/tokens/price-token';
import { ZrxTrade } from './zrx-trade';
export declare abstract class ZrxAbstractProvider extends InstantTradeProvider {
    protected readonly gasMargin = 1.4;
    private readonly defaultOptions;
    private get apiBaseUrl();
    calculate(from: PriceTokenAmount, to: PriceToken, options?: SwapCalculationOptions): Promise<ZrxTrade>;
    /**
     * Fetches zrx data from api.
     */
    private getTradeData;
}
