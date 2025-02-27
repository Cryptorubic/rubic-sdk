import { SwapRequestInterface } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import {
    FailedToCheckForTransactionReceiptError,
    RubicSdkError,
    UnnecessaryApproveError
} from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TronTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/models/tron-transaction-options';
import { TronWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/tron-web3-private';
import { TronWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/tron-web3-public';
import { TronTransactionConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-transaction-config';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { CrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { MarkRequired } from 'ts-essentials';

export abstract class TronCrossChainTrade extends CrossChainTrade<TronTransactionConfig> {
    public abstract readonly from: PriceTokenAmount<TronBlockchainName>;

    protected get fromWeb3Public(): TronWeb3Public {
        return Injector.web3PublicService.getWeb3Public(this.from.blockchain);
    }

    protected get web3Private(): TronWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain);
    }

    /**
     * Returns true, if allowance is not enough.
     */
    public override async needApprove(): Promise<boolean> {
        this.checkWalletConnected();

        if (this.from.isNative) {
            return false;
        }

        const allowance = await this.fromWeb3Public.getAllowance(
            this.from.address,
            this.walletAddress,
            this.contractSpender
        );
        return this.from.weiAmount.gt(allowance);
    }

    public override async approve(
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
            this.contractSpender,
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

    public async swap(
        options: MarkRequired<SwapTransactionOptions, 'receiverAddress'>
    ): Promise<string | never> {
        if (!options?.testMode) {
            await this.checkTradeErrors();
        }
        await this.checkReceiverAddress(options.receiverAddress, true);
        const method = options?.testMode ? 'sendTransaction' : 'trySendTransaction';

        const { onConfirm } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        const fromAddress = this.walletAddress;
        const transactionConfig = await this.encode({ ...options, fromAddress });

        try {
            await this.web3Private[method](
                transactionConfig.to,
                transactionConfig.signature,
                transactionConfig.arguments,
                {
                    onTransactionHash,
                    ...(transactionConfig?.feeLimit && { feeLimit: transactionConfig.feeLimit }),
                    ...(transactionConfig.callValue && { callValue: transactionConfig.callValue }),
                    ...(transactionConfig.rawParameter && {
                        rawParameter: transactionConfig.rawParameter
                    })
                }
            );

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw err;
        }
    }

    public async encode(
        options: MarkRequired<EncodeTransactionOptions, 'receiverAddress'>
    ): Promise<TronTransactionConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress, true);

        return this.setTransactionConfig(
            options?.skipAmountCheck || false,
            options?.useCacheData || false,
            options.testMode,
            options?.receiverAddress || this.walletAddress
        );
    }

    public async encodeApprove(
        tokenAddress: string,
        spenderAddress: string,
        value: BigNumber | 'infinity',
        options: TronTransactionOptions = {}
    ): Promise<TronTransactionConfig> {
        return this.web3Private.encodeApprove(tokenAddress, spenderAddress, value, options);
    }

    public getUsdPrice(): BigNumber {
        let feeSum = new BigNumber(0);
        const providerFee = this.feeInfo.provider?.cryptoFee;
        if (providerFee) {
            feeSum = feeSum.plus(providerFee.amount.multipliedBy(providerFee.token.price));
        }

        return this.to.price.multipliedBy(this.to.tokenAmount).minus(feeSum);
    }

    protected async getTransactionConfigAndAmount(
        testMode?: boolean,
        receiverAddress?: string
    ): Promise<{ config: TronTransactionConfig; amount: string }> {
        const swapRequestParams: SwapRequestInterface = {
            ...this.apiQuote,
            fromAddress: this.walletAddress,
            receiver: receiverAddress,
            id: this.apiResponse.id,
            enableChecks: !testMode
        };

        const swapData = await Injector.rubicApiService.fetchSwapData<TronTransactionConfig>(
            swapRequestParams
        );

        const toAmount = swapData.estimate.destinationWeiAmount;

        return { config: swapData.transaction, amount: toAmount };
    }

    public authWallet(): Promise<string> {
        throw new RubicSdkError('Method not implemented.');
    }
}
