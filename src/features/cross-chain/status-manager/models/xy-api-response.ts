export interface XyApiResponse {
    isSuccess: boolean;
    msg: string;
    status: 'Done' | 'Processing' | string;
    txHash: string | null;
}
