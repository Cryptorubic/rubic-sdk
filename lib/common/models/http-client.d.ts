export interface HttpClient {
    post<ResponseBody>(url: string, body: Object): Promise<ResponseBody>;
    get<ResponseBody>(url: string, options?: {
        headers?: {
            [header: string]: string | string[];
        };
        params?: {
            [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
        };
    }): Promise<ResponseBody>;
}
