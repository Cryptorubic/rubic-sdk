import { UniswapV3AlgebraTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-trade-struct';
import { QuickSwapV3Route } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap-v3/models/quick-swap-v3-route';

export interface QuickSwapV3TradeStruct extends UniswapV3AlgebraTradeStruct {
    route: QuickSwapV3Route;
}
