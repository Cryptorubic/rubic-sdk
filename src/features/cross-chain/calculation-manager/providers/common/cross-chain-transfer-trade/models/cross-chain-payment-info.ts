export interface CrossChainPaymentInfo {
    id: string;
    depositAddress: string;
    extraField?: {
        name?: string;
        value?: string;
    };
}

export interface CrossChainTransferData {
    id: string;
    toAmount: string;
    depositAddress: string;
    depositExtraId?: string;
    depositExtraIdName?: string;
}
