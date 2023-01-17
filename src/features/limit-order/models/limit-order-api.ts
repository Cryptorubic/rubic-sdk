export interface LimitOrderApiResponse {
    createDateTime: string;
    data: {
        makerAsset: string;
        takerAsset: string;
        makingAmount: string;
        takingAmount: string;
        interactions: string;
        offsets: string;
    };
    orderInvalidReason: null | string;
}
