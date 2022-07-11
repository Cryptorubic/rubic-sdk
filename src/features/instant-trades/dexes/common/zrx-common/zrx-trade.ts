import { Injector } from '@rsdk-core/sdk/injector';
import { InstantTrade } from '@rsdk-features/instant-trades/instant-trade';
import { SwapTransactionOptions } from '@rsdk-features/instant-trades/models/swap-transaction-options';
import { TRADE_TYPE, TradeType } from 'src/features';
import { TransactionReceipt } from 'web3-eth';
import { ZrxQuoteResponse } from '@rsdk-features/instant-trades/dexes/common/zrx-common/models/zrx-types';
import { PriceTokenAmount } from '@rsdk-core/blockchain/tokens/price-token-amount';
import { GasFeeInfo } from '@rsdk-features/instant-trades/models/gas-fee-info';
import { EncodeTransactionOptions } from '@rsdk-features/instant-trades/models/encode-transaction-options';
import { TransactionConfig } from 'web3-core';
import { Token } from 'src/core';

interface ZrxTradeStruct {
    from: PriceTokenAmount;
    to: PriceTokenAmount;
    slippageTolerance: number;
    apiTradeData: ZrxQuoteResponse;
    path: ReadonlyArray<Token>;
    gasFeeInfo?: GasFeeInfo;
}

export class ZrxTrade extends InstantTrade {
    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    /**
     * In Zrx you can't change slippage after calculation is done.
     */
    public readonly slippageTolerance: number;

    public gasFeeInfo: GasFeeInfo | null;

    private readonly apiTradeData: ZrxQuoteResponse;

    protected readonly contractAddress: string;

    public readonly path: ReadonlyArray<Token>;

    public get type(): TradeType {
        return TRADE_TYPE.ZRX_ETHEREUM;
    }

    constructor(tradeStruct: ZrxTradeStruct) {
        super(tradeStruct.from.blockchain);

        this.from = tradeStruct.from;
        this.to = tradeStruct.to;
        this.gasFeeInfo = tradeStruct.gasFeeInfo || null;
        this.slippageTolerance = tradeStruct.slippageTolerance;
        this.apiTradeData = tradeStruct.apiTradeData;
        this.contractAddress = this.apiTradeData.to;
        this.path = tradeStruct.path;
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<TransactionReceipt> {
        await this.checkWalletState();

        await this.checkAllowanceAndApprove(options);

        const { gas, gasPrice } = this.getGasParams(options);

        return Injector.web3Private.trySendTransaction(
            this.apiTradeData.to,
            this.apiTradeData.value,
            {
                onTransactionHash: options.onConfirm,
                data: this.apiTradeData.data,
                gas,
                gasPrice
            }
        );
    }

    public async encode(options: EncodeTransactionOptions): Promise<TransactionConfig> {
        const { gas, gasPrice } = this.getGasParams(options);

        return {
            to: this.apiTradeData.to,
            data: this.apiTradeData.data,
            value: this.apiTradeData.value,
            gas,
            gasPrice
        };
    }
}
