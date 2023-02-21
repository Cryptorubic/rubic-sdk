export interface ChangenowCurrency {
    ticker: string;
    network: string;
    tokenContract: string | null;
}

export type ChangenowCurrenciesResponse = ChangenowCurrency[];
