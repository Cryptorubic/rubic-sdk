import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { NativeRouterQuoteRequestParams } from '../common/native-router-abstract/models/native-router-quote';
import { NativeRouterTradeStruct } from '../common/native-router-abstract/models/native-router-trade-struct';
import { NativeRouterAbstractTrade } from '../common/native-router-abstract/native-router-abstract-trade';

export class NativeRouterTrade extends NativeRouterAbstractTrade {
    public readonly type = ON_CHAIN_TRADE_TYPE.NATIVE_ROUTER;

    constructor(
        nativeRouterStruct: NativeRouterTradeStruct,
        providerAddress: string,
        nativeRouterQuoteParams: NativeRouterQuoteRequestParams,
        providerGateway: string
    ) {
        super(nativeRouterStruct, providerAddress, nativeRouterQuoteParams, providerGateway);
    }
}
