import { PCache } from '@common/decorators/cache.decorator';
import { AxiosInstance } from 'axios';

export class DefaultHttpClient {
    @PCache
    public static getInstance(): Promise<AxiosInstance> {
        return import('axios') as unknown as Promise<AxiosInstance>;
    }
}
