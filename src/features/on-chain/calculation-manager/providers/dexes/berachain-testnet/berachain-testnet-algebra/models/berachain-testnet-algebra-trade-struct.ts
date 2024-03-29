import { BerachainTestnetAlgebraRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/berachain-testnet/berachain-testnet-algebra/models/berachain-testnet-algebra-route';
import { UniswapV3AlgebraTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-trade-struct';

export interface BerachainTestnetAlgebraTradeStruct extends UniswapV3AlgebraTradeStruct {
    route: BerachainTestnetAlgebraRoute;
}
