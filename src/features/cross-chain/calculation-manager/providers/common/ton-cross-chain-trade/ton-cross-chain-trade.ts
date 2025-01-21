import { SwapRequestInterface } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { FailedToCheckForTransactionReceiptError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, TonBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TonWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/ton-web3-private';
import { TonWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/ton-web3-public/ton-web3-public';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { CrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';

import { TonTransactionConfig } from '../models/ton-transaction-config';

export abstract class TonCrossChainTrade extends CrossChainTrade<TonTransactionConfig> {
    public abstract readonly from: PriceTokenAmount<TonBlockchainName>;

    /**
     * Gas fee info in source blockchain.
     */
    protected get fromWeb3Public(): TonWeb3Public {
        return Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.TON);
    }

    protected get web3Private(): TonWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(BLOCKCHAIN_NAME.TON);
    }

    public async encode(options: EncodeTransactionOptions): Promise<TonTransactionConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress, true);

        return this.setTransactionConfig(
            options?.skipAmountCheck || false,
            options?.useCacheData || false,
            options?.receiverAddress || this.walletAddress
        );
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        if (!options?.testMode) {
            await this.checkTradeErrors();
        }
        await this.checkReceiverAddress(options.receiverAddress, true);

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

    protected async getTransactionConfigAndAmount(
        receiverAddress: string
    ): Promise<{ config: TonTransactionConfig; amount: string }> {
        const swapRequestParams: SwapRequestInterface = {
            ...this.apiQuote,
            fromAddress: this.walletAddress,
            receiver: receiverAddress,
            id: this.apiResponse.id
        };

        const swapData = await Injector.rubicApiService.fetchSwapData<TonTransactionConfig>(
            swapRequestParams
        );

        const toAmount = swapData.estimate.destinationWeiAmount;

        return { config: swapData.transaction, amount: toAmount };
    }

    public getUsdPrice(providerFeeToken?: BigNumber): BigNumber {
        let feeSum = new BigNumber(0);
        const providerFee = this.feeInfo.provider?.cryptoFee;
        if (providerFee) {
            feeSum = feeSum.plus(
                providerFee.amount.multipliedBy(providerFeeToken || providerFee.token.price)
            );
        }

        return this.to.price.multipliedBy(this.to.tokenAmount).minus(feeSum);
    }
}
