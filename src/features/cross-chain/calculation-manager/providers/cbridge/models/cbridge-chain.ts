export interface CbridgeChain {
    // @ts-ignore
    readonly id: number;
    readonly name: string;
    readonly icon: string;
    readonly block_delay: string;
    readonly gas_token_symbol: string;
    readonly explore_url: string;
    readonly contract_addr: string;
}
