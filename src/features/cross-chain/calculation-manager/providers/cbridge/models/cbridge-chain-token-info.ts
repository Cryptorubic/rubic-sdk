interface Token {
    readonly symbol: string;
    readonly address: string;
    readonly decimal: number;
    readonly xfer_disabled: boolean;
}

export interface TokenInfo {
    readonly token: Token;
    readonly name: string;
    readonly icon: string;
    readonly delay_period: number;
    readonly delay_threshold: string;
    readonly inbound_epoch_cap: string;
    readonly inbound_lmt: string;
    readonly liq_add_disabled: boolean;
    readonly liq_agg_rm_src_disabled: boolean;
    readonly liq_rm_disabled: boolean;
    readonly transfer_disabled: boolean;
}

export interface CbridgeChainTokenInfo {
    readonly token: TokenInfo[];
}
