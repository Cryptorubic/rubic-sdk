import { TransactionRequest } from '@ethersproject/abstract-provider';
import { SymbiosisTradeType } from 'symbiosis-js-sdk/dist/crosschain/trade';
import { Percent, Token, TokenAmount } from 'symbiosis-js-sdk/dist/entities';

export interface SymbiosisTradeData {
    tokenAmountOut: TokenAmount;
    priceImpact: Percent;
    fee: TokenAmount;
    transactionRequest: TransactionRequest;
    route: Token[];
    inTradeType?: SymbiosisTradeType;
    outTradeType?: SymbiosisTradeType;
}
