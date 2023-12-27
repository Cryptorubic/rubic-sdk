export interface XyApiResponse {
    success: boolean;
    msg: string;
    status: 'Done' | 'Processing' | string;
    tx: string | null;
}
