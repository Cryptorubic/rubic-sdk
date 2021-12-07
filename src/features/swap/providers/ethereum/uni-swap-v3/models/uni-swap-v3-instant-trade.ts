import { UniSwapV3Route } from '@features/swap/providers/ethereum/uni-swap-v3/models/uni-swap-v3-route';
import { InstantTrade } from '@features/swap/trades/instant-trade';
import { SymbolToken } from '@core/blockchain/tokens/symbol-token';

export interface UniSwapV3InstantTrade extends InstantTrade {
    deadline: number;

    path: ReadonlyArray<SymbolToken>;

    /**
     * Route info, containing path and output amount.
     */
    route: UniSwapV3Route;
}
