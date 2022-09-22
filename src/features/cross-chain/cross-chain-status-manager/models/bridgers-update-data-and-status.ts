export interface BridgersUpdateDataAndStatusRequest {
    hash: string;
    fromTokenChain: string;

    sourceFlag: 'rubic';
}

export interface BridgersUpdateDataAndStatusResponse {
    data: {
        orderId?: string;
    };
}
