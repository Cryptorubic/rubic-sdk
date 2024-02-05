import { ICrossRule, ITransferConfig, TTransactionResponse } from '@orbiter-finance/bridge-sdk';

export interface OrbiterQuoteRequestParams {
    fromAmount: number;
    config: OrbiterQuoteConfig;
}

export interface OrbiterTokenSymbols {
    [chainId: string | number]: {
        [tokenAddress: string]: string;
    };
}

export type OrbiterQuoteConfig = ICrossRule;

export type OrbiterSwapRequestParams = ITransferConfig;

// export type OrbiterStatusResponse = ISearchTxResponse;

export interface OrbiterStatusResponse {
    result: {
        chainId: string;
        hash: string;
        sender: string;
        receiver: string;
        amount: string;
        symbol: string;
        timestamp: string;
        /* 2 - success, 3 - fail */
        status: OrbiterTxStatus;
        /* 0 - waiting for payment,  */
        opStatus: OrbiterOpTxStatus;
        /* destination status tx-hash */
        targetId: string;
        targetAmount: string;
        targetSymbol: string;
        targetChain: string;
    };
}

export type OrbiterSwapResponse = TTransactionResponse;

export const ORBITER_STATUS = {
    ERROR: 3,
    SUCCESS: 2
} as const;

export type OrbiterTxStatus = (typeof ORBITER_STATUS)[keyof typeof ORBITER_STATUS];

export const ORBITER_OP_STATUS = {
    SOURCE_CHAIN_OR_TOKEN_NOT_FOUND: 2,
    TARGET_CHAIN_OR_TOKEN_NOT_FOUND: 3,
    RULE_NOT_FOUND: 4,
    NONCE_EXCEED_MAXIMUM: 5,
    AMOUNT_TOO_SMALL: 6,
    REFUND: 80,
    MONEY_WILL_REFUND: 96,
    ABNORMAL_PAYMENT: 97,
    MONEY_REFUNDED: 98,
    SUCCESS_PAYMENT: 99
};

export type OrbiterOpTxStatus = (typeof ORBITER_OP_STATUS)[keyof typeof ORBITER_OP_STATUS];
