export interface HttpClient {
    post<T>(url: string, body: Object): Promise<T>;
    get<T>(
        url: string,
        options?: {
            headers?: {
                [header: string]: string | string[];
            };
            params?: {
                [param: string]:
                    | string
                    | number
                    | boolean
                    | ReadonlyArray<string | number | boolean>;
            };
        }
    ): Promise<T>;
}
