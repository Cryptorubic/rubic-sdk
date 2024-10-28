export type TonApiResp<SuccessRespType> = TonApiFailResp | SuccessRespType;
export type TonApiAccountStatus = 'active' | 'uninit' | 'frozen' | 'nonexist';

export interface TonApiFailResp {
    error: string;
}

export interface TonApiSeqnoResp {
    seqno: number;
}

export interface TonApiTxDataByBocResp {
    hash: string;
    lt: number;
    success: boolean;
    aborted: boolean;
    destroyed: boolean;
    total_fees: number;
    in_msg: object;
    out_msgs: { hash: string }[];
}

export interface TonApiStatusByBocResp {
    in_progress: boolean;
    lt: number;
}

export interface TonApiHealthcheckResp {
    rest_online: boolean;
    indexing_latency: number;
}

export interface TonApiAccountInfoResp {
    /** raw address */
    address: string;
    balance: number;
    /** in unix format */
    last_activity: number;
    status: TonApiAccountStatus;
    interfaces: string[];
    // ['get_public_key', 'seqno' ...]
    get_methods: string[];
    is_wallet: boolean;
}

export interface TonApiCallContractCommonResp<T> {
    success: boolean;
    exit_code: number;
    stack: Array<{
        type: string;
        num: string;
    }>;
    decoded: T;
}

export interface TonApiParseAddressResp {
    raw_form: string;
    bounceable: {
        b64: string;
        // friendly format
        b64url: string;
    };
    non_bounceable: {
        b64: string;
        // friendly format
        b64url: string;
    };
    given_type: string;
    test_only: false;
}

export interface TonApiAllNonNullableTokenInfoForWalletResp {
    balances: TonApiTokenInfoForWalletResp[];
}

export interface TonApiTokenInfoForWalletResp {
    balance: string;
    price?: {
        prices: {
            // k is 'usd', 'rub', 'ton', 'usdc' etc.
            [k: string]: string;
        };
    };
    wallet_address: {
        /** address of user's contract for this token */
        address: string;
        is_scam: boolean;
        is_wallet: boolean;
    };
    jetton: {
        /** address of token(jetton) contract. Similaer to ERC20 contract address in EVM */
        address: string;
        name: string;
        symbol: string;
        decimals: number;
        image: string;
        verification: string;
    };
}

export interface TonApiTokenInfoResp {
    mintable: boolean;
    total_supply: string;
    metadata: {
        address: string;
        name: string;
        symbol: string;
        decimals: string;
        image: string;
    };
    verification: string;
    holders_count: number;
}
