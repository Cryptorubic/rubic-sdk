import { LimitOrder as OneinchOrderData } from '@1inch/limit-order-protocol-utils/model/limit-order-protocol.model';

/**
 * Limit order structure, returned bu 1inch api.
 */
export interface LimitOrderApi {
    orderHash: string;
    signature: string;
    createDateTime: string;
    remainingMakerAmount: string;
    makerBalance: string;
    data: OneinchOrderData;
    orderInvalidReason: null | string;
}

export type LimitOrderApiResponse = LimitOrderApi[];
