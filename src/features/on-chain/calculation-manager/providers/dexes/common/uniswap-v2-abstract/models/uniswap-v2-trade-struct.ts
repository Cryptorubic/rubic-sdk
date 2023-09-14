import { Token } from 'src/common/tokens';
import { EvmOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import { AerodromeRoutePoolArgument } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/aerodrome-route-method-arguments';

export interface UniswapV2TradeStruct extends EvmOnChainTradeStruct {
    exact: Exact;
    wrappedPath: ReadonlyArray<Token> | Token[];
    deadlineMinutes: number;
    routPoolInfo: AerodromeRoutePoolArgument[] | undefined;
}
