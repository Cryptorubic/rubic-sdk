import { ICrossRule, ITransferConfig } from '@orbiter-finance/bridge-sdk';

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
