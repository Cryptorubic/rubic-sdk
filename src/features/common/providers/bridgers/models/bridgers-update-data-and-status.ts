export interface BridgersUpdateDataAndStatusRequest {
    hash: string;
    fromTokenChain: string;

    sourceFlag: 'rubic' | 'rubic_widget'; // @todo update types
}

export interface BridgersUpdateDataAndStatusResponse {
    data: {
        orderId?: string;
    };
}
