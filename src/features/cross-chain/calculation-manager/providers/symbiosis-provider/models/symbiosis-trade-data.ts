import { TransactionRequest } from '@ethersproject/abstract-provider';

export type SymbiosisTradeType = 'dex' | '1inch' | 'open-ocean' | 'wrap' | 'izumi';

export interface SymbiosisToken {
    chainId: number;
    decimals: number;
    address: string;
    isNative: boolean;
    symbol?: string;
    name?: string;
}

export interface SymbiosisTokenAmount extends SymbiosisToken {
    amount: string;
}

export interface SymbiosisTradeData {
    fee: SymbiosisTokenAmount;
    priceImpact: string;
    tokenAmountOut: SymbiosisTokenAmount;
    tx: TransactionRequest;
    amountInUsd: SymbiosisTokenAmount;
    approveTo: string;
    route: SymbiosisToken[];
    inTradeType: SymbiosisTradeType;
    outTradeType: SymbiosisTradeType;
    rewards: SymbiosisTokenAmount[];
}
