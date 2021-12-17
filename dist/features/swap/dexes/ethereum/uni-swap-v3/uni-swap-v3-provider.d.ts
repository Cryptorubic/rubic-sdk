import { BLOCKCHAIN_NAME } from '../../../../../core/blockchain/models/BLOCKCHAIN_NAME';
import { PriceTokenAmount } from '../../../../../core/blockchain/tokens/price-token-amount';
import { PriceToken } from '../../../../../core/blockchain/tokens/price-token';
import { UniSwapV3Trade } from './uni-swap-v3-trade';
import { SwapCalculationOptions } from '../../../models/swap-calculation-options';
import { InstantTradeProvider } from '../../../instant-trade-provider';
export declare class UniSwapV3Provider extends InstantTradeProvider {
    readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;
    protected readonly defaultOptions: Required<SwapCalculationOptions>;
    protected readonly gasMargin = 1.2;
    private readonly maxTransitPools;
    private wethAddress;
    private liquidityPoolsController;
    calculate(from: PriceTokenAmount, toToken: PriceToken, options?: SwapCalculationOptions): Promise<UniSwapV3Trade>;
    /**
     * Returns most profitable route and estimated gas, if related option in {@param options} is set.
     * @param from From token and amount.
     * @param toToken To token.
     * @param options Swap options.
     * @param gasPriceInUsd Gas price in usd.
     */
    private getRoute;
}
