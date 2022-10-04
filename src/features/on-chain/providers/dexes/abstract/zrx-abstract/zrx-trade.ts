import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { ZrxQuoteResponse } from 'src/features/on-chain/providers/dexes/abstract/zrx-abstract/models/zrx-types';
import { GasFeeInfo } from 'src/features/on-chain/providers/abstract/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { TransactionConfig } from 'web3-core';
import { PriceTokenAmount, Token } from 'src/common/tokens';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/providers/models/on-chain-trade-type';
import { UnsupportedReceiverAddressError } from 'src/common/errors';
import { EvmOnChainTrade } from 'src/features/on-chain/providers/abstract/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';

interface ZrxTradeStruct {
    from: PriceTokenAmount<EvmBlockchainName>;
    to: PriceTokenAmount<EvmBlockchainName>;
    slippageTolerance: number;
    apiTradeData: ZrxQuoteResponse;
    path: ReadonlyArray<Token>;
    gasFeeInfo?: GasFeeInfo;
}

export class ZrxTrade extends EvmOnChainTrade {
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

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.ZRX;
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

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
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

    public async encode(options: EncodeTransactionOptions): Promise<TransactionConfig> {
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
