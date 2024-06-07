import { EvmOnChainTradeStruct } from '../../../../common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { NativeRouterTransactionRequest } from './native-router-transaction-request';

export interface NativeRouterTradeStruct extends EvmOnChainTradeStruct {
    txRequest: NativeRouterTransactionRequest;
}
