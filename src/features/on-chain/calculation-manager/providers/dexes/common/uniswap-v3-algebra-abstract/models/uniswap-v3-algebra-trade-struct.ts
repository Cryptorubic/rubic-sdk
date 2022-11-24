import { EvmOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';

export interface UniswapV3AlgebraTradeStruct extends EvmOnChainTradeStruct {
    exact: Exact;
    deadlineMinutes: number;
}

export type UniswapV3AlgebraTradeStructOmitPath = Omit<UniswapV3AlgebraTradeStruct, 'path'>;
