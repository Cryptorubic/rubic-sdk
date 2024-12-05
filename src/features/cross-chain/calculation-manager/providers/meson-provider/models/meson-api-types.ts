export type MesonErrorRes<T> = {
    error: {
        error: {
            code: number;
            data: T;
            message: string;
        };
    };
};

export type MesonSuccessRes<T> = {
    result: T;
};

export type SrcDstChainsIds = [string, string];

export interface MesonChainsInfo {
    result: MesonChain[];
}

export interface MesonChain {
    /* Meson-api chain symbol */
    id: string;
    name: string;
    chainId: string;
    /* meson contract address in chain */
    address: string;
    tokens: Array<{ id: string; addr?: string }>;
}

export interface MesonLimitsResponse {
    result: MesonLimitsChain[];
}

export interface MesonLimitsChain {
    id: string;
    name: string;
    /* in hex */
    chainId: string;
    /* meson contract address in chain */
    address: string;
    tokens: MesonLimitsToken[];
}

export interface MesonLimitsToken {
    /* Meson-api token symbol */
    id: string;
    /* addr is absent for native currency */
    addr?: string;
    /* in decimal number format - example 1.5, 0.001 etc   */
    min: string;
    max: string;
}

export interface FetchEncodedParamRequest {
    /* chain:token - example `bnb:usdc` */
    sourceAssetString: string;
    targetAssetString: string;
    /* in decimal number format - example 1.5, 0.001 etc   */
    amount: string;
    /* WalletAddress or rubic-multi-proxy-contract address */
    fromAddress: string;
    receiverAddress: string;
    useProxy: boolean;
}

export interface EncodeSwapSchema {
    encoded: string;
    fromAddress: string;
    fromContract: string;
    recipient: string;
    fee: {
        serviceFee: string;
        lpFee: string;
        totalFee: string;
        signingRequest: object;
    };
    converted?: { amount: string; token: string };
    initiator: string;
}

export interface TxFeeSchema {
    serviceFee: string;
    lpFee: string;
    /* in decimal number format - example 1.5, 0.001 etc   */
    totalFee: string;
    converted?: { amount: string; token: string };
}

export interface ErrorFeeResp {
    fee: string;
}

export interface TxStatusSchema {
    expired?: boolean;
    LOCKED: string;
    BONDED: string;
    EXECUTED: string;
    RELEASED: string;
    swap: {
        id: string;
        encoded: string;
        from: {
            amount: string;
            network: string;
            token: string;
        };
        to: {
            amount: string;
            network: string;
            token: string;
        };
    };
}
