import {
    BasicTransactionOptions,
    PriceTokenAmount,
    TransactionOptions,
    Web3Public,
    Web3Pure
} from 'src/core';
import { GasData } from '@features/cross-chain/models/gas-data';
import { Injector } from '@core/sdk/injector';
import BigNumber from 'bignumber.js';
import { EncodeTransactionOptions, SwapTransactionOptions } from 'src/features';
import { UnnecessaryApprove, WalletNotConnectedError, WrongNetworkError } from 'src/common';
import { TransactionReceipt } from 'web3-eth';
import { ContractParams } from '@features/cross-chain/models/contract-params';
import { TransactionConfig } from 'web3-core';

export abstract class CrossChainTrade {
    public abstract readonly to: PriceTokenAmount;

    public abstract readonly from: PriceTokenAmount;

    protected abstract readonly gasData: GasData | null;

    protected abstract readonly fromWeb3Public: Web3Public;

    protected abstract get fromContractAddress(): string;

    protected get walletAddress(): string {
        return Injector.web3Private.address;
    }

    public get estimatedGas(): BigNumber | null {
        if (!this.gasData) {
            return null;
        }
        return Web3Pure.fromWei(this.gasData.gasPrice).multipliedBy(this.gasData.gasLimit);
    }

    protected constructor(protected readonly providerAddress: string) {}

    public abstract swap(options?: SwapTransactionOptions): Promise<string | never>;

    protected abstract getContractParams(fromAddress?: string): Promise<ContractParams>;

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

    public async approve(options: BasicTransactionOptions): Promise<TransactionReceipt> {
        if (!(await this.needApprove())) {
            throw new UnnecessaryApprove();
        }

        this.checkWalletConnected();
        this.checkBlockchainCorrect();

        return Injector.web3Private.approveTokens(
            this.from.address,
            this.fromContractAddress,
            'infinity',
            options
        );
    }

    protected async checkAllowanceAndApprove(
        options?: Omit<SwapTransactionOptions, 'onConfirm'>
    ): Promise<void> {
        const needApprove = await this.needApprove();
        if (!needApprove) {
            return;
        }

        const txOptions: TransactionOptions = {
            onTransactionHash: options?.onApprove,
            gas: options?.gasLimit || undefined,
            gasPrice: options?.gasPrice || undefined
        };

        await Injector.web3Private.approveTokens(
            this.from.address,
            this.fromContractAddress,
            'infinity',
            txOptions
        );
    }

    public async encode(options: EncodeTransactionOptions): Promise<TransactionConfig> {
        const { gasLimit, gasPrice } = options;

        const { contractAddress, contractAbi, methodName, methodArguments, value } =
            await this.getContractParams(options.fromAddress);

        return Web3Pure.encodeMethodCall(
            contractAddress,
            contractAbi,
            methodName,
            methodArguments,
            value,
            {
                gas: gasLimit || this.gasData?.gasLimit.toFixed(0),
                gasPrice: gasPrice || this.gasData?.gasPrice.toFixed()
            }
        );
    }

    protected checkWalletConnected(): never | void {
        if (!this.walletAddress) {
            throw new WalletNotConnectedError();
        }
    }

    protected checkBlockchainCorrect(): never | void {
        if (Injector.web3Private.blockchainName !== this.from.blockchain) {
            throw new WrongNetworkError();
        }
    }

    protected checkUserBalance(): Promise<void | never> {
        return this.fromWeb3Public.checkBalance(
            this.from,
            this.from.tokenAmount,
            this.walletAddress
        );
    }
}
