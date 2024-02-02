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
        /* use it */
        status: OrbiterTxStatus;
        /* destination status tx-hash */
        targetId: string;
        targetAmount: string;
        targetSymbol: string;
        targetChain: string;
        opStatus: number;
    };
}

export type OrbiterSwapResponse = TTransactionResponse;

export const ORBITER_STATUS = {
    ERROR: 3,
    SUCCESS: 2
} as const;

export type OrbiterTxStatus = (typeof ORBITER_STATUS)[keyof typeof ORBITER_STATUS];
