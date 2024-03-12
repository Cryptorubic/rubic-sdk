import { EvmOnChainTradeStruct } from '../../../common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { OkuQuoteRequestBody, OkuSwapRequestBody } from './okuswap-api-types';

export interface OkuSwapOnChainTradeStruct extends EvmOnChainTradeStruct {
    subProvider: string;
    swapReqBody: OkuSwapRequestBody;
    quoteReqBody: OkuQuoteRequestBody;
}
