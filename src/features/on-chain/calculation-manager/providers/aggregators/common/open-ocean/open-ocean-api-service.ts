import { Injector } from 'src/core/injector/injector';

type HttpParam = {
    [param: string]: string | number | boolean | readonly (string | number | boolean)[];
};

export class OpenOceanApiService {
    public static getQuote<T extends HttpParam, D>(
        params: T,
        url: string,
        apiKey?: string
    ): Promise<D> {
        return Injector.httpClient.get<D>(url, {
            params: {
                ...params
            },
            headers: {
                ...(apiKey && { apiKey: apiKey })
            }
        });
    }

    public static getSupportedTokenList<T>(url: string, apiKey?: string): Promise<T> {
        return Injector.httpClient.get<T>(url, {
            headers: {
                ...(apiKey && { apiKey: apiKey })
            }
        });
    }
}
