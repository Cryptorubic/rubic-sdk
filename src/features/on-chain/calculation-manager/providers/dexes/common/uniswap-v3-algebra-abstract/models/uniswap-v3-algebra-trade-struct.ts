import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import { EvmOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';

export interface UniswapV3AlgebraTradeStruct extends EvmOnChainTradeStruct {
    exact: Exact;
    deadlineMinutes: number;
}
