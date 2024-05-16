import { BlastFenixRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/blast/fenix-blast/models/blast-fenix-route';
import { UniswapV3AlgebraTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-trade-struct';

export interface BlastFenixTradeStruct extends UniswapV3AlgebraTradeStruct {
    route: BlastFenixRoute;
}
