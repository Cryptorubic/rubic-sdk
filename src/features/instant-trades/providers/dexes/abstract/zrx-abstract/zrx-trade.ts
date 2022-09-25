import { InstantTrade } from 'src/features/instant-trades/providers/abstract/instant-trade';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { ZrxQuoteResponse } from 'src/features/instant-trades/providers/dexes/abstract/zrx-abstract/models/zrx-types';
import { GasFeeInfo } from 'src/features/instant-trades/providers/models/gas-fee-info';
import { TransactionReceipt } from 'web3-eth';
import { SwapTransactionOptions } from 'src/features/instant-trades/providers/models/swap-transaction-options';
import { TransactionConfig } from 'web3-core';
import { PriceTokenAmount, Token } from 'src/common/tokens';
import { TRADE_TYPE, TradeType } from 'src/features/instant-trades/providers/models/trade-type';
import { EncodeTransactionOptions } from 'src/features/instant-trades/providers/models/encode-transaction-options';
import { UnsupportedReceiverAddressError } from 'src/common/errors';

interface ZrxTradeStruct {
    from: PriceTokenAmount<EvmBlockchainName>;
    to: PriceTokenAmount<EvmBlockchainName>;
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
        return TRADE_TYPE.ZRX;
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
        if (options?.receiverAddress) {
            throw new UnsupportedReceiverAddressError();
        }

        await this.checkWalletState();

        await this.checkAllowanceAndApprove(options);

        const { gas, gasPrice } = this.getGasParams(options);

        return this.web3Private.trySendTransaction(this.apiTradeData.to, this.apiTradeData.value, {
            onTransactionHash: options.onConfirm,
            data: this.apiTradeData.data,
            gas,
            gasPrice
        });
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
