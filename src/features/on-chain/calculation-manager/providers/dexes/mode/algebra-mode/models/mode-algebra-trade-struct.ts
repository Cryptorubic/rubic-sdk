import { UniswapV3AlgebraTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-trade-struct';
import { ModeAlgebraRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/mode/algebra-mode/models/mode-algebra-route';

export interface ModeAlgebraTradeStruct extends UniswapV3AlgebraTradeStruct {
    route: ModeAlgebraRoute;
}
