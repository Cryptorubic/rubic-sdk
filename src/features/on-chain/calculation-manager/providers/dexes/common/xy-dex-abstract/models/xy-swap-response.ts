import { XyQuoteResponse } from 'src/features/on-chain/calculation-manager/providers/dexes/common/xy-dex-abstract/models/xy-quote-response';

export interface XySwapResponse extends XyQuoteResponse {
    tx: {
        to: string;
        data: string;
        value: string;
    };
}
