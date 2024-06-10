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
    // wei-amount
    raw_value: string;
    // "1.2"
    ui_value: string;
}

export interface RequiredPairInfoFields {
    contractAddress: string;
    srcChainName: string;
    dstChainName: string;
    tokenSymbol: string;
    minAmount: string;
    maxAmount: string;
}

export interface OwlTopSwapRequest {
    srcChainName: string;
    dstChainName: string;
    amount: string;
    tokenSymbol: string;
    walletAddress: string;
    receiverAddress: string;
}

export interface OwlToSwapResponse {
    data: {
        bridge_fee: OwlToAmountInfo;
        from_chain_name: string;
        gas_fee: OwlToAmountInfo;
        input_value: OwlToAmountInfo;
        max_value: OwlToAmountInfo;
        min_value: OwlToAmountInfo;
        network_type: number;
        /* receive_value.raw_value is toStringWeiAmount */
        receive_value: OwlToAmountInfo;
        send_value: OwlToAmountInfo;
        to_chain_name: string;
        token_name: string;
        txs: {
            approve_body: object;
            transfer_body: {
                data: string;
                to: string;
                value: string;
            };
        };
    };
}

export interface OwlToStatusResponse {
    data: {
        to_chain_hash: string;
    };
}
