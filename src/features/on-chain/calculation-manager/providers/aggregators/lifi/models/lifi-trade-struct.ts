import BigNumber from 'bignumber.js';
import { Route } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/models/lifi-route';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';

import { SolanaOnChainTradeStruct } from '../../../common/on-chain-trade/solana-on-chain-trade/models/solana-on-chain-trade-struct';

interface LifiTradeStruct {
    type: OnChainTradeType;
    route: Route;
    toTokenWeiAmountMin: BigNumber;
}

export interface LifiEvmOnChainTradeStruct extends EvmOnChainTradeStruct, LifiTradeStruct {}

export interface LifiSolanaOnChainTradeStruct extends SolanaOnChainTradeStruct, LifiTradeStruct {}
