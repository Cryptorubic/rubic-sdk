import { XyRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/common/xy-dex-abstract/models/xy-quote-response';

export interface XySwapResponse {
    tx: {
        to: string;
        data: string;
        value: string;
    };
    route: XyRoute;
    success: boolean;
}
