import { InstantTrade } from '../../../instant-trade';
import { SwapTransactionOptions } from '../../../models/swap-transaction-options';
import { TradeType } from '../../../..';
import { TransactionReceipt } from 'web3-eth';
import { ZrxQuoteResponse } from './models/zrx-types';
import { PriceTokenAmount } from '../../../../../core/blockchain/tokens/price-token-amount';
import { GasFeeInfo } from '../../../models/gas-fee-info';
import { EncodeTransactionOptions } from '../../../models/encode-transaction-options';
import { TransactionConfig } from 'web3-core';
interface ZrxTradeStruct {
    from: PriceTokenAmount;
    to: PriceTokenAmount;
    slippageTolerance: number;
    apiTradeData: ZrxQuoteResponse;
    gasFeeInfo?: GasFeeInfo;
}
export declare class ZrxTrade extends InstantTrade {
    readonly from: PriceTokenAmount;
    readonly to: PriceTokenAmount;
    /**
     * In Zrx you can't change slippage after calculation is done.
     */
    readonly slippageTolerance: number;
    gasFeeInfo: GasFeeInfo | null;
    private readonly apiTradeData;
    protected readonly contractAddress: string;
    get type(): TradeType;
    constructor(tradeStruct: ZrxTradeStruct);
    swap(options?: SwapTransactionOptions): Promise<TransactionReceipt>;
    encode(options?: EncodeTransactionOptions): Promise<TransactionConfig>;
    private getGasParamsFromApiTradeData;
}
export {};
