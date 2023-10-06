import BigNumber from 'bignumber.js';
import {
    FailedToCheckForTransactionReceiptError,
    UnnecessaryApproveError
} from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TronTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/models/tron-transaction-options';
import { TronWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/tron-web3-private';
import { TronWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/tron-web3-public';
import { TronTransactionConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-transaction-config';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/tron-web3-pure';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { CrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { TronContractParams } from 'src/features/cross-chain/calculation-manager/providers/common/tron-cross-chain-trade/models/tron-contract-params';
import { TronGetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/tron-cross-chain-trade/models/tron-get-contract-params-options';
import { MarkRequired } from 'ts-essentials';

export abstract class TronCrossChainTrade extends CrossChainTrade {
    public abstract readonly from: PriceTokenAmount<TronBlockchainName>;

    protected get fromWeb3Public(): TronWeb3Public {
        return Injector.web3PublicService.getWeb3Public(this.from.blockchain);
    }

    protected get web3Private(): TronWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain);
    }

    public async approve(
        options: TronTransactionOptions,
        checkNeedApprove = true
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
            this.fromContractAddress,
            'infinity',
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
        await this.checkTradeErrors();
        await this.checkReceiverAddress(options.receiverAddress, true);

        await this.checkAllowanceAndApprove(options);

        const { onConfirm } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        const { contractAddress, contractAbi, methodName, methodArguments, value, feeLimit } =
            await this.getContractParams(options);

        try {
            await this.web3Private.executeContractMethod(
                contractAddress,
                contractAbi,
                methodName,
                methodArguments,
                {
                    onTransactionHash,
                    callValue: value,
                    feeLimit: options.feeLimit || feeLimit
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

        const { contractAddress, contractAbi, methodName, methodArguments, value, feeLimit } =
            await this.getContractParams({
                fromAddress: options.fromAddress,
                receiverAddress: options.receiverAddress
            });

        return TronWeb3Pure.encodeMethodCall(
            contractAddress,
            contractAbi,
            methodName,
            methodArguments,
            value,
            options.feeLimit || feeLimit
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

    protected abstract getContractParams(
        options: TronGetContractParamsOptions
    ): Promise<TronContractParams>;

    public getUsdPrice(): BigNumber {
        let feeSum = new BigNumber(0);
        const providerFee = this.feeInfo.provider?.cryptoFee;
        if (providerFee) {
            feeSum = feeSum.plus(providerFee.amount.multipliedBy(providerFee.token.price));
        }
        const platformFee = this.feeInfo.rubicProxy?.fixedFee;
        if (platformFee) {
            feeSum = feeSum.plus(platformFee.amount.multipliedBy(platformFee.token.price));
        }

        return this.to.price.multipliedBy(this.to.tokenAmount).minus(feeSum);
    }
}
