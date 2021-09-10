export interface HttpClient {
    post<T>(url: string, body: Object): Promise<T>;
}
