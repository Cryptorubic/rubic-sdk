export interface ChangellyToken {
    name: string;
    ticker: string;
    fullName: string;
    enabled: boolean;
    enabledFrom: boolean;
    enabledTo: boolean;
    protocol: string;
    blockchain: string;
    contractAddress?: string;
    extraIdName?: string;
}
