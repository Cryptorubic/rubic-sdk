import { AxiosInstance } from 'axios';
import { Cache } from '@rsdk-common/decorators/cache.decorator';

export class DefaultHttpClient {
    @Cache
    public static async getInstance(): Promise<AxiosInstance> {
        const axios = (await import('axios')) as unknown as AxiosInstance;
        DefaultHttpClient.addBodyInterceptor(axios);
        DefaultHttpClient.addCacheDisablingInterceptor(axios);
        return axios;
    }

    private static addBodyInterceptor(axios: AxiosInstance): void {
        axios.interceptors.response.use(
            response => response.data,
            error => Promise.reject(error)
        );
    }

    private static addCacheDisablingInterceptor(axios: AxiosInstance): void {
        axios.interceptors.request.use(
            request => {
                request.params = { ...request.params, timestamp: Date.now() };
                return request;
            },
            error => Promise.reject(error)
        );
    }
}
