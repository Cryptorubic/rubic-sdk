export interface UniZenCcrTxResponse {
    srcTxHash: string;
    dstTxHash: string;
    srcChainId: number;
    dstChainId: number;
    status: 'DELIVERED' | 'PENDING';
}
