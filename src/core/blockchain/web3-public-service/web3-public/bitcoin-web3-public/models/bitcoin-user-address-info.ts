export interface BitcoinTxInput {
    prev_hash: string;
    output_index: number;
    output_value: number;
    sequence: number;
    addresses: string[];
    script_type: string;
    age?: number;
    witness: string[];
}

export interface BitcoinTxOutput {
    value: number;
    script: string;
    addresses: string[];
    script_type: string;
    spent_by?: string;
}

export interface BitcoinTxInfo {
    block_hash?: string;
    block_height: number;
    block_index: number;
    hash: string;
    addresses: string[];
    total: number;
    fees: number;
    size: number;
    vsize: number;
    preference: string;
    relayed_by: string;
    confirmed?: string;
    received: string;
    ver: number;
    double_spend: boolean;
    vin_sz: number;
    vout_sz: number;
    confirmations?: number;
    confidence?: number;
    inputs: BitcoinTxInput[];
    outputs: BitcoinTxOutput[];
    opt_in_rbf?: boolean;
}

export interface BitcoinUserAddressInfo {
    address: string;
    total_received: number;
    total_sent: number;
    balance: number;
    unconfirmed_balance: number;
    final_balance: number;
    n_tx: number;
    unconfirmed_n_tx: number;
    final_n_tx: number;
    txs: BitcoinTxInfo[];
}
