import { TransactionRequest } from '@ethersproject/abstract-provider';
import { Percent, Token, TokenAmount } from 'symbiosis-js-sdk/dist/entities';

export interface SymbiosisTradeData {
    tokenAmountOut: TokenAmount;
    priceImpact: Percent;
    fee: TokenAmount;
    transactionRequest: TransactionRequest;
    route: Token[];
}
