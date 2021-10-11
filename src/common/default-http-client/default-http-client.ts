import { AxiosInstance } from 'axios';
import { PCacheable } from 'ts-cacheable';

export class DefaultHttpClient {
    @PCacheable()
    public static getInstance(): Promise<AxiosInstance> {
        return import('axios') as unknown as Promise<AxiosInstance>;
    }
}
