import { TransactionRequest } from '@ethersproject/abstract-provider';
import { SendTransactionRequest } from '@tonconnect/sdk';

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
    tx: SendTransactionRequest | TransactionRequest;
    amountInUsd: SymbiosisTokenAmount;
    approveTo: string;
    route: SymbiosisToken[];
    inTradeType: SymbiosisTradeType;
    outTradeType: SymbiosisTradeType;
    rewards: SymbiosisTokenAmount[];
}
