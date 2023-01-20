import { EvmOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';

export interface CurveOnChainTradeStruct extends EvmOnChainTradeStruct {
    poolAddress: string;
    registryExchangeAddress: string;
}
