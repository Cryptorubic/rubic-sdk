import { TransactionRequest } from '@ethersproject/abstract-provider';
import { Percent } from 'symbiosis-js-sdk-v1';
import { TokenAmount as SymbiosisTokenAmount } from 'symbiosis-js-sdk-v1/dist/entities/fractions/tokenAmount';

export interface SymbiosisTradeData {
    tokenAmountOut: SymbiosisTokenAmount;
    priceImpact: Percent;
    fee: SymbiosisTokenAmount;
    transactionRequest: TransactionRequest;
    version: 'v1' | 'v2';
}
