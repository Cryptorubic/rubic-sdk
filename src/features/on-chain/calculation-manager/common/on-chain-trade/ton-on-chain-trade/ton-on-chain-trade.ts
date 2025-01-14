import {
    QuoteRequestInterface,
    QuoteResponseInterface,
    SwapRequestInterface
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import {
    FailedToCheckForTransactionReceiptError,
    InsufficientFundsError,
    RubicSdkError
} from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { TonWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/ton-web3-private';
import { TonWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/ton-web3-public/ton-web3-public';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TonTransactionConfig } from 'src/features/cross-chain/calculation-manager/providers/common/models/ton-transaction-config';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { TransactionConfig } from 'web3-core';

import { GasFeeInfo } from '../evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../on-chain-trade';
import { TonOnChainTradeStruct, TonTradeAdditionalInfo } from './models/ton-on-chian-trade-types';

export abstract class TonOnChainTrade extends OnChainTrade {
    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    public readonly slippageTolerance: number;

    public readonly feeInfo: FeeInfo = {};

    public readonly gasFeeInfo: GasFeeInfo | null;

    public readonly path = [];

    private readonly routingPath: RubicStep[];

    protected skipAmountCheck: boolean = false;

    public readonly additionalInfo: TonTradeAdditionalInfo;

    private readonly apiQuote: QuoteRequestInterface | null = null;

    private readonly apiResponse: QuoteResponseInterface | null = null;

    protected get spenderAddress(): string {
        throw new RubicSdkError('No spender address!');
    }

    protected get web3Public(): TonWeb3Public {
        return Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.TON);
    }

    protected get web3Private(): TonWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(BLOCKCHAIN_NAME.TON);
    }

    constructor(tradeStruct: TonOnChainTradeStruct, providerAddress: string) {
        super(providerAddress);
        this.from = tradeStruct.from;
        this.to = tradeStruct.to;
        this.slippageTolerance = tradeStruct.slippageTolerance;
        this.gasFeeInfo = tradeStruct.gasFeeInfo;
        this.routingPath = tradeStruct.routingPath;
        this.additionalInfo = {
            isMultistep: this.routingPath.length > 1,
            isChangedSlippage: tradeStruct.isChangedSlippage
        };

        this.apiQuote = tradeStruct?.apiQuote || null;
        this.apiResponse = tradeStruct?.apiResponse || null;
    }

    public override async needApprove(): Promise<boolean> {
        return false;
    }

    public async approve(): Promise<void> {
        throw new RubicSdkError('Method not implemented!');
    }

    public async encodeApprove(): Promise<TransactionConfig> {
        throw new Error('Method is not supported');
    }

    public async encode(options: EncodeTransactionOptions): Promise<TonTransactionConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);

        return this.setTransactionConfig(options);
    }

    public async swap(options: SwapTransactionOptions): Promise<string | never> {
        await this.checkWalletState(options?.testMode);

        const fromAddress = this.walletAddress;
        const transactionConfig = await this.encode({ ...options, fromAddress });

        const { onConfirm } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        try {
            await this.web3Private.sendTransaction({
                messages: transactionConfig.tonMessages,
                onTransactionHash
            });

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw err;
        }
    }

    protected async setTransactionConfig(
        options: EncodeTransactionOptions
    ): Promise<TonTransactionConfig> {
        const { config, amount } = await this.getTransactionConfigAndAmount(
            options.receiverAddress
        );

        if (!options.skipAmountCheck) {
            this.checkAmountChange(amount, this.to.stringWeiAmount);
        }
        return config;
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: TonTransactionConfig; amount: string }> {
        if (!this.apiResponse || !this.apiQuote) {
            throw new Error('Failed to load api response');
        }

        const swapRequestParams: SwapRequestInterface = {
            ...this.apiQuote,
            fromAddress: this.walletAddress,
            receiver: receiverAddress || this.walletAddress,
            id: this.apiResponse.id
        };

        const swapData = await Injector.rubicApiService.fetchSwapData<TonTransactionConfig>(
            swapRequestParams
        );

        const toAmount = swapData.estimate.destinationWeiAmount;

        return { config: swapData.transaction, amount: toAmount };
    }

    protected async checkNativeBalance(): Promise<void> {
        const balanceWei = await this.web3Public.getBalance(this.walletAddress);
        const balanceNonWei = Web3Pure.fromWei(balanceWei, nativeTokensList.TON.decimals);
        const requiredBalanceNonWei = this.gasFeeInfo?.totalGas
            ? Web3Pure.fromWei(this.gasFeeInfo.totalGas, nativeTokensList.TON.decimals)
            : new BigNumber(0);

        if (balanceWei.lt(requiredBalanceNonWei)) {
            throw new InsufficientFundsError(
                nativeTokensList[BLOCKCHAIN_NAME.TON],
                balanceNonWei,
                requiredBalanceNonWei
            );
        }
    }

    protected async makePreSwapChecks(options: EncodeTransactionOptions): Promise<void> {
        checkUnsupportedReceiverAddress(options.receiverAddress, this.walletAddress);
        await this.checkFromAddress(options.fromAddress);
        await this.checkNativeBalance();
        await this.checkBalance();

        if (!options.skipAmountCheck) {
            this.skipAmountCheck = true;
            const toWeiAmount = await this.calculateOutputAmount(options);
            this.checkAmountChange(toWeiAmount, this.to.stringWeiAmount);
        }
    }

    /**
     * recalculates and returns output stringWeiAmount
     */
    protected abstract calculateOutputAmount(options: EncodeTransactionOptions): Promise<string>;

    public override getTradeInfo(): TradeInfo {
        return {
            estimatedGas: null,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: this.slippageTolerance * 100,
            routePath: this.routingPath
        };
    }
}
