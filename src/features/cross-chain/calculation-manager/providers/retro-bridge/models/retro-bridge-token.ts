export interface RetroBridgeToken {
    name: string;
    native: boolean;
    contract_address: string;
    active: boolean;
    pairs: Omit<RetroBridgeToken, 'pairs'>[];
}
