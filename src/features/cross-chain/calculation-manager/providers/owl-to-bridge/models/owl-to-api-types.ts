export interface OwlToAllPairsInfoResponse {
    data: {
        pair_infos: OwlToPairInfo[];
    };
}

export interface OwlToPairInfo {
    contract_address: string;
    from_chain_id: string;
    /* required to get tx-data */
    from_chain_name: string;
    from_token_address: string;
    from_token_decimals: number;
    max_value: OwlToAmountInfo;
    min_value: OwlToAmountInfo;
    to_chain_id: string;
    /* required to get tx-data */
    to_chain_name: string;
    to_token_address: string;
    to_token_decimals: number;
    /* required to get tx-data */
    token_name: string;
}

interface OwlToAmountInfo {
    decimals: number;
    raw_value: string;
    ui_value: string;
}

export interface RequiredPairInfo {
    contractAddress: string;
    srcChainName: string;
    dstChainName: string;
    tokenSymbol: string;
    minAmount: string;
    maxAmount: string;
}
