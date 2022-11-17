import { Token } from 'src/common/tokens';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import { EvmOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';

export interface UniswapV2TradeStruct extends EvmOnChainTradeStruct {
    exact: Exact;
    wrappedPath: ReadonlyArray<Token> | Token[];
    deadlineMinutes: number;
}
