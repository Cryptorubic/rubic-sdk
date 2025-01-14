import {
    QuoteRequestInterface,
    QuoteResponseInterface,
    SwapRequestInterface
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import {
    FailedToCheckForTransactionReceiptError,
    UnnecessaryApproveError
} from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { parseError } from 'src/common/utils/errors';
import { TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TronTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/models/tron-transaction-options';
import { TronWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/tron-web3-private';
import { TronWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/tron-web3-public';
import { TronTransactionConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-transaction-config';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/common/on-chain-trade/on-chain-trade';
import { TronEncodedConfigAndToAmount } from 'src/features/on-chain/calculation-manager/models/aggregator-on-chain-types';

export abstract class TronOnChainTrade extends OnChainTrade {
    protected lastTransactionConfig: TronTransactionConfig | null = null;

    public abstract readonly from: PriceTokenAmount<TronBlockchainName>;

    public abstract readonly to: PriceTokenAmount<TronBlockchainName>;

    protected get web3Public(): TronWeb3Public {
        return Injector.web3PublicService.getWeb3Public(this.from.blockchain);
    }

    protected get web3Private(): TronWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain);
    }

    private readonly apiQuote: QuoteRequestInterface | null = null;

    private readonly apiResponse: QuoteResponseInterface | null = null;

    constructor(
        integratorAddress: string,
        apiQuote?: QuoteRequestInterface,
        apiResponse?: QuoteResponseInterface
    ) {
        super(integratorAddress);
        this.apiQuote = apiQuote || null;
        this.apiResponse = apiResponse || null;
    }

    public async approve(
        options: TronTransactionOptions,
        checkNeedApprove = true,
        amount: BigNumber | 'infinity' = 'infinity'
    ): Promise<string> {
        if (checkNeedApprove) {
            const needApprove = await this.needApprove();
            if (!needApprove) {
                throw new UnnecessaryApproveError();
            }
        }

        this.checkWalletConnected();
        await this.checkBlockchainCorrect();

        return this.web3Private.approveTokens(
            this.from.address,
            this.spenderAddress,
            amount,
            options
        );
    }

    protected async checkAllowanceAndApprove(
        options?: Omit<SwapTransactionOptions, 'onConfirm' | 'feeLimit'>
    ): Promise<void> {
        const needApprove = await this.needApprove();
        if (!needApprove) {
            return;
        }

        const approveOptions: TronTransactionOptions = {
            onTransactionHash: options?.onApprove,
            feeLimit: options?.approveFeeLimit
        };
        await this.approve(approveOptions, false);
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkWalletState(options?.testMode);
        await this.checkAllowanceAndApprove(options);

        const { onConfirm } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        const fromAddress = this.walletAddress;
        const transactionData = await this.encode({
            ...options,
            fromAddress
        });
        const method = options?.testMode ? 'sendTransaction' : 'trySendTransaction';

        try {
            await this.web3Private[method](
                transactionData.to,
                transactionData.signature,
                transactionData.arguments,
                {
                    onTransactionHash,
                    ...(transactionData?.feeLimit && { feeLimit: transactionData.feeLimit }),
                    ...(transactionData.callValue && { callValue: transactionData.callValue }),
                    ...(transactionData.rawParameter && {
                        rawParameter: transactionData.rawParameter
                    })
                }
            );

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }

            throw parseError(err);
        }
    }

    public async encode(options: EncodeTransactionOptions): Promise<TronTransactionConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);

        return this.setTransactionConfig(options);
    }

    protected async setTransactionConfig(
        options: EncodeTransactionOptions
    ): Promise<TronTransactionConfig> {
        if (this.lastTransactionConfig && options.useCacheData) {
            return this.lastTransactionConfig;
        }

        const { tx, toAmount } = await this.getTransactionConfigAndAmount(options.receiverAddress);
        this.lastTransactionConfig = tx;
        setTimeout(() => {
            this.lastTransactionConfig = null;
        }, 15_000);

        if (!options.skipAmountCheck) {
            this.checkAmountChange(toAmount, this.to.stringWeiAmount);
        }
        return tx;
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<TronEncodedConfigAndToAmount> {
        if (!this.apiResponse || !this.apiQuote) {
            throw new Error('Failed to load api response');
        }
        const swapRequestData: SwapRequestInterface = {
            ...this.apiQuote,
            fromAddress: this.walletAddress,
            receiver: receiverAddress || this.walletAddress,
            id: this.apiResponse.id
        };
        const { transaction, estimate } =
            await Injector.rubicApiService.fetchSwapData<TronTransactionConfig>(swapRequestData);

        const amount = estimate.destinationWeiAmount;

        return { tx: transaction, toAmount: amount };
    }

    public async encodeApprove(
        tokenAddress: string,
        spenderAddress: string,
        value: BigNumber | 'infinity',
        options: TronTransactionOptions = {}
    ): Promise<TronTransactionConfig> {
        return this.web3Private.encodeApprove(tokenAddress, spenderAddress, value, options);
    }
}
