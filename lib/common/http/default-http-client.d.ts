import { AxiosInstance } from 'axios';
export declare class DefaultHttpClient {
    static getInstance(): Promise<AxiosInstance>;
    private static addBodyInterceptor;
    private static addCacheDisablingInterceptor;
}
