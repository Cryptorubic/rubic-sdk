import { PriceTokenAmount } from '../../../../../core/blockchain/tokens/price-token-amount';
import { PriceToken } from '../../../../../core/blockchain/tokens/price-token';
import { OneinchTrade } from './oneinch-trade';
import { InstantTradeProvider } from '../../../instant-trade-provider';
import { SwapCalculationOptions } from '../../../models/swap-calculation-options';
declare type OneinchSwapCalculationOptions = Omit<SwapCalculationOptions, 'deadlineMinutes'>;
export declare abstract class OneinchAbstractProvider extends InstantTradeProvider {
    private readonly httpClient;
    private readonly defaultOptions;
    protected readonly gasMargin = 1;
    private supportedTokens;
    private get walletAddress();
    private get apiBaseUrl();
    private getSupportedTokensByBlockchain;
    private loadContractAddress;
    calculate(from: PriceTokenAmount, toToken: PriceToken, options?: OneinchSwapCalculationOptions): Promise<OneinchTrade>;
    private getTradeInfo;
    /**
     * Extracts tokens path from oneInch api response.
     * @return Promise<Token[]> Tokens array, used in the route.
     */
    private extractPath;
}
export {};
