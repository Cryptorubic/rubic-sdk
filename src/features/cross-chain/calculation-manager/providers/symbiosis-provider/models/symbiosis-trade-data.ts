import { TransactionRequest } from '@ethersproject/abstract-provider';
import { Percent, TokenAmount } from 'symbiosis-js-sdk/dist/entities';

export interface SymbiosisTradeData {
    tokenAmountOut: TokenAmount;
    priceImpact: Percent;
    fee: TokenAmount;
    transactionRequest: TransactionRequest;
}
