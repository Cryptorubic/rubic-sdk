export interface SimpleSwapCurrency {
    name: string;
    symbol: string;
    network: string;
    contract_address: string | null;
    extra_id: string;
    has_extra_id: boolean;
    validation_extra: string | null;
}
