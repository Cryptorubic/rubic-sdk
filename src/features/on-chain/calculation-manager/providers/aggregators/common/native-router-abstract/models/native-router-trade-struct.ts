import { EvmOnChainTradeStruct } from '../../../../common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { GasFeeInfo } from '../../../../common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { NativeRouterQuoteRequestParams } from './native-router-quote';
import { NativeRouterTransactionRequest } from './native-router-transaction-request';

export interface NativeRouterTradeStruct extends EvmOnChainTradeStruct {
    txRequest: NativeRouterTransactionRequest;
}

export interface NativeRouterTradeInstance {
    tradeStruct: NativeRouterTradeStruct & { gasFeeInfo: GasFeeInfo | null };
    providerAddress: string;
    nativeRouterQuoteParams: NativeRouterQuoteRequestParams;
    providerGateway: string;
}
