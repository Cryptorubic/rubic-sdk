import { InstantTrade } from '@features/swap/instant-trade';
import { TransactionReceipt } from 'web3-eth';
import { SwapTransactionOptions } from '@features/swap/models/swap-transaction-options';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { GasFeeInfo } from '@features/swap/models/gas-fee-info';
import { Token } from '@core/blockchain/tokens/token';
import { TransactionConfig } from 'web3-core';
import { EncodeFromAddressTransactionOptions } from '@features/swap/models/encode-transaction-options';
declare type OneinchTradeStruct = {
    contractAddress: string;
    from: PriceTokenAmount;
    to: PriceTokenAmount;
    slippageTolerance: number;
    disableMultihops: boolean;
    path: ReadonlyArray<Token>;
    gasFeeInfo?: GasFeeInfo | null;
};
export declare class OneinchTrade extends InstantTrade {
    static checkIfNeedApproveAndThrowError(from: PriceTokenAmount): Promise<void | never>;
    private readonly httpClient;
    protected readonly contractAddress: string;
    readonly from: PriceTokenAmount;
    readonly to: PriceTokenAmount;
    gasFeeInfo: GasFeeInfo | null;
    slippageTolerance: number;
    private readonly disableMultihops;
    readonly path: ReadonlyArray<Token>;
    private get apiBaseUrl();
    constructor(oneinchTradeStruct: OneinchTradeStruct);
    needApprove(): Promise<boolean>;
    swap(options?: SwapTransactionOptions): Promise<TransactionReceipt>;
    encode(options: EncodeFromAddressTransactionOptions): Promise<TransactionConfig>;
    private getTradeData;
    private getGasParamsFromApiTradeData;
    private specifyError;
}
export {};
