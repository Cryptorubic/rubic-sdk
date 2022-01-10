import { PriceToken } from '../../../../../core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '../../../../../core/blockchain/tokens/price-token-amount';
import { SwapCalculationOptions } from '../../../models/swap-calculation-options';
import { UniswapV2ProviderConfiguration } from './models/uniswap-v2-provider-configuration';
import { UniswapV2TradeClass } from './models/uniswap-v2-trade-class';
import { InstantTradeProvider } from '../../../instant-trade-provider';
import { UniswapV2AbstractTrade } from './uniswap-v2-abstract-trade';
import BigNumber from 'bignumber.js';
import { TradeType } from '../../../..';
export declare abstract class UniswapV2AbstractProvider<T extends UniswapV2AbstractTrade = UniswapV2AbstractTrade> extends InstantTradeProvider {
    abstract readonly InstantTradeClass: UniswapV2TradeClass<T>;
    abstract readonly providerSettings: UniswapV2ProviderConfiguration;
    get type(): TradeType;
    protected readonly defaultOptions: Required<SwapCalculationOptions>;
    protected readonly gasMargin = 1.2;
    calculate(from: PriceTokenAmount, to: PriceToken, options?: SwapCalculationOptions): Promise<UniswapV2AbstractTrade>;
    calculateExactOutput(from: PriceToken, to: PriceTokenAmount, options?: SwapCalculationOptions): Promise<UniswapV2AbstractTrade>;
    calculateDifficultTrade(from: PriceToken, to: PriceToken, weiAmount: BigNumber, exact: 'input' | 'output', options?: SwapCalculationOptions): Promise<UniswapV2AbstractTrade>;
    private getAmountAndPath;
}
