import { CrossChainTrade } from 'src/features/cross-chain/providers/common/cross-chain-trade';
import { PriceTokenAmount } from 'src/common/tokens';
import { TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';
import {
    FailedToCheckForTransactionReceiptError,
    RubicSdkError,
    UnnecessaryApproveError
} from 'src/common/errors';
import { TransactionConfig } from 'web3-core';
import { TronWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/tron-web3-public';
import { TronWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/tron-web3-private';
import { TronTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/models/tron-transaction-options';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/tron-web3-pure';
import { TronSwapTransactionOptions } from 'src/features/cross-chain/providers/common/tron-cross-chain-trade/models/tron-swap-transaction-options';
import { TronEncodeTransactionOptions } from 'src/features/cross-chain/providers/common/tron-cross-chain-trade/models/tron-encode-transaction-options';
import { TronGetContractParamsOptions } from 'src/features/cross-chain/providers/common/tron-cross-chain-trade/models/tron-get-contract-params-options';
import BigNumber from 'bignumber.js';
import { TronContractParams } from 'src/features/cross-chain/providers/common/tron-cross-chain-trade/models/tron-contract-params';

export abstract class TronCrossChainTrade extends CrossChainTrade {
    public abstract readonly from: PriceTokenAmount<TronBlockchainName>;

    protected get fromWeb3Public(): TronWeb3Public {
        return Injector.web3PublicService.getWeb3Public(this.from.blockchain);
    }

    protected get web3Private(): TronWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain);
    }

    public async needApprove(): Promise<boolean> {
        this.checkWalletConnected();

        if (this.from.isNative) {
            return false;
        }

        const allowance = await this.fromWeb3Public.getAllowance(
            this.from.address,
            this.walletAddress,
            this.fromContractAddress
        );
        return this.from.weiAmount.gt(allowance);
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
            this.from.weiAmount,
            options
        );
    }

    protected async checkAllowanceAndApprove(
        options?: Omit<TronSwapTransactionOptions, 'onConfirm' | 'feeLimit'>
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

    public async swap(options: TronSwapTransactionOptions): Promise<string | never> {
        await this.checkTradeErrors();
        await this.checkAllowanceAndApprove(options);

        if (!options.receiverAddress) {
            throw new RubicSdkError(`'receiverAddress' is required option`);
        }
        CrossChainTrade.checkReceiverAddress(options.receiverAddress, this.to.blockchain);

        const { contractAddress, contractAbi, methodName, methodArguments, value, feeLimit } =
            await this.getContractParams(options);

        const { onConfirm } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

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

    public async encode(options: TronEncodeTransactionOptions): Promise<TransactionConfig> {
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
    ): Promise<TransactionConfig> {
        return this.web3Private.encodeApprove(tokenAddress, spenderAddress, value, options);
    }

    protected abstract getContractParams(
        options: TronGetContractParamsOptions
    ): Promise<TronContractParams>;
}
