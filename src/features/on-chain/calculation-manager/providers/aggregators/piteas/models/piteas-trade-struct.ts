import { PiteasMethodParameters } from 'src/features/on-chain/calculation-manager/providers/aggregators/piteas/models/piteas-quote';

import { EvmOnChainTradeStruct } from '../../../common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';

export interface PiteasTradeStruct extends EvmOnChainTradeStruct {
    methodParameters: PiteasMethodParameters;
}
