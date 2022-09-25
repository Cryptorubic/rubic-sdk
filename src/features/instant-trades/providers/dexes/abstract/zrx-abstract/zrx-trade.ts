import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { ZrxQuoteResponse } from 'src/features/instant-trades/providers/dexes/abstract/zrx-abstract/models/zrx-types';
import { GasFeeInfo } from 'src/features/instant-trades/providers/models/gas-fee-info';
import { TransactionConfig } from 'web3-core';
import { PriceTokenAmount, Token } from 'src/common/tokens';
import { TRADE_TYPE, TradeType } from 'src/features/instant-trades/providers/models/trade-type';
import { UnsupportedReceiverAddressError } from 'src/common/errors';
import { EvmInstantTrade } from 'src/features/instant-trades/providers/abstract/evm-instant-trade/evm-instant-trade';
import { EvmSwapTransactionOptions } from 'src/features/common/models/evm/evm-swap-transaction-options';
import { EvmEncodeTransactionOptions } from 'src/features/common/models/evm/evm-encode-transaction-options';

interface ZrxTradeStruct {
    from: PriceTokenAmount<EvmBlockchainName>;
    to: PriceTokenAmount<EvmBlockchainName>;
    slippageTolerance: number;
    apiTradeData: ZrxQuoteResponse;
    path: ReadonlyArray<Token>;
    gasFeeInfo?: GasFeeInfo;
}

export class ZrxTrade extends EvmInstantTrade {
    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

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
        super();

        this.from = tradeStruct.from;
        this.to = tradeStruct.to;
        this.gasFeeInfo = tradeStruct.gasFeeInfo || null;
        this.slippageTolerance = tradeStruct.slippageTolerance;
        this.apiTradeData = tradeStruct.apiTradeData;
        this.contractAddress = this.apiTradeData.to;
        this.path = tradeStruct.path;
    }

    public async swap(options: EvmSwapTransactionOptions = {}): Promise<string | never> {
        if (options?.receiverAddress) {
            throw new UnsupportedReceiverAddressError();
        }

        await this.checkWalletState();
        await this.checkAllowanceAndApprove(options);

        const { gas, gasPrice } = this.getGasParams(options);

        const receipt = await this.web3Private.trySendTransaction(
            this.apiTradeData.to,
            this.apiTradeData.value,
            {
                onTransactionHash: options.onConfirm,
                data: this.apiTradeData.data,
                gas,
                gasPrice
            }
        );
        return receipt.transactionHash;
    }

    public async encode(options: EvmEncodeTransactionOptions): Promise<TransactionConfig> {
        if (options?.receiverAddress) {
            throw new UnsupportedReceiverAddressError();
        }

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
