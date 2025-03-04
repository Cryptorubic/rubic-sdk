import { AggregatorResult } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { SuiOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/sui-on-chain-trade/models/sui-on-chain-trade-struct';

export interface CetusTradeStruct extends SuiOnChainTradeStruct {
    aggregatorResult: AggregatorResult;
}
