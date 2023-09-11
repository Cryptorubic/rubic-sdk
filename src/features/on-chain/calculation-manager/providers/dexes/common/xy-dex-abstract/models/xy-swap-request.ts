import { XyQuoteRequest } from 'src/features/on-chain/calculation-manager/providers/dexes/common/xy-dex-abstract/models/xy-quote-request';

export interface XySwapRequest extends XyQuoteRequest {
    receiver: string;
    srcSwapProvider: string;
}
