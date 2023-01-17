import { LimitOrder as OneinchOrderData } from '@1inch/limit-order-protocol-utils/model/limit-order-protocol.model';

export interface LimitOrderApi {
    orderHash: string;
    createDateTime: string;
    data: OneinchOrderData;
    orderInvalidReason: null | string;
}

export type LimitOrderApiResponse = LimitOrderApi[];
