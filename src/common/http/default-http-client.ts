import { PCache } from '@common/decorators/cache.decorator';
import { AxiosInstance } from 'axios';

export class DefaultHttpClient {
    @PCache
    public static async getInstance(): Promise<AxiosInstance> {
        const axios = (await import('axios')) as unknown as AxiosInstance;
        DefaultHttpClient.addBodyInterceptor(axios);
        return axios;
    }

    private static addBodyInterceptor(axios: AxiosInstance): void {
        axios.interceptors.response.use(
            response => response.data,
            error => Promise.reject(error)
        );
    }
}
