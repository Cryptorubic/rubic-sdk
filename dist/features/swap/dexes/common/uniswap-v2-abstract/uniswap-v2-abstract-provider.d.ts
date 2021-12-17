import { PriceToken } from '@core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { SwapCalculationOptions } from '@features/swap/models/swap-calculation-options';
import { UniswapV2ProviderConfiguration } from '@features/swap/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { UniswapV2TradeClass } from '@features/swap/dexes/common/uniswap-v2-abstract/models/uniswap-v2-trade-class';
import { InstantTradeProvider } from '@features/swap/instant-trade-provider';
import { UniswapV2AbstractTrade } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import BigNumber from 'bignumber.js';
export declare abstract class UniswapV2AbstractProvider<T extends UniswapV2AbstractTrade = UniswapV2AbstractTrade> extends InstantTradeProvider {
    abstract readonly InstantTradeClass: UniswapV2TradeClass<T>;
    abstract readonly providerSettings: UniswapV2ProviderConfiguration;
    protected readonly defaultOptions: Required<SwapCalculationOptions>;
    protected readonly gasMargin = 1.2;
    calculate(from: PriceTokenAmount, to: PriceToken, options?: SwapCalculationOptions): Promise<UniswapV2AbstractTrade>;
    calculateExactOutput(from: PriceToken, to: PriceTokenAmount, options?: SwapCalculationOptions): Promise<UniswapV2AbstractTrade>;
    calculateDifficultTrade(from: PriceToken, to: PriceToken, weiAmount: BigNumber, exact: 'input' | 'output', options?: SwapCalculationOptions): Promise<UniswapV2AbstractTrade>;
    private getAmountAndPath;
}
