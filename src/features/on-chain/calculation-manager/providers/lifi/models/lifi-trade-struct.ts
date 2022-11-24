import { Route } from '@lifi/sdk';
import BigNumber from 'bignumber.js';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';

export interface LifiTradeStruct extends EvmOnChainTradeStruct {
    type: OnChainTradeType;
    route: Route;
    toTokenWeiAmountMin: BigNumber;
}
