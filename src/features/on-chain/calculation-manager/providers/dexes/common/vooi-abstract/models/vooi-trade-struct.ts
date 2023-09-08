import { EvmOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';

export interface VooiTradeStruct extends EvmOnChainTradeStruct {
    fromPoolId: number;
    toPoolId: number;
    deadlineMinutes: number;
}
