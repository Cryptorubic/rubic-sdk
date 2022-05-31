import {
    BasicTransactionOptions,
    PriceTokenAmount,
    TransactionOptions,
    Web3Public,
    Web3Pure
} from 'src/core';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { EncodeTransactionOptions, SwapTransactionOptions } from 'src/features';
import { TransactionConfig } from 'web3-core';
import {
    Cache,
    CrossChainIsUnavailableError,
    MaxGasPriceOverflowError,
    UnnecessaryApprove,
    WalletNotConnectedError,
    WrongNetworkError
} from 'src/common';
import { CrossChainContractTrade } from '@features/cross-chain/providers/common/cross-chain-contract-trade';
import { GasData } from '@features/cross-chain/models/gas-data';
import { Injector } from '@core/sdk/injector';
import { ContractParams } from '@features/cross-chain/models/contract-params';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/blockchain-name';

export abstract class CrossChainTrade {
    public abstract readonly toTokenAmountMin: BigNumber;

    @Cache
    public get priceImpactData(): {
        priceImpactFrom: number | null;
        priceImpactTo: number | null;
    } {
        const calculatePriceImpact = (trade: CrossChainContractTrade): number | null => {
            return trade.fromToken.calculatePriceImpactPercent(trade.toToken);
        };

        return {
            priceImpactFrom: calculatePriceImpact(this.fromTrade),
            priceImpactTo: calculatePriceImpact(this.toTrade)
        };
    }

    protected abstract readonly fromTrade: CrossChainContractTrade;

    protected abstract readonly toTrade: CrossChainContractTrade;

    protected abstract readonly gasData: GasData | null;

    protected abstract readonly cryptoFeeToken: PriceTokenAmount;

    protected abstract readonly fromWeb3Public: Web3Public;

    protected abstract readonly toWeb3Public: Web3Public;

    public abstract readonly to: PriceTokenAmount;

    public abstract readonly from: PriceTokenAmount;

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

    protected abstract checkTradeErrors(): Promise<void | never>;

    public async needApprove(): Promise<boolean> {
        this.checkWalletConnected();

        if (this.fromTrade.fromToken.isNative) {
            return false;
        }

        const allowance = await this.fromWeb3Public.getAllowance(
            this.fromTrade.fromToken.address,
            this.walletAddress,
            this.fromTrade.contract.address
        );
        return this.fromTrade.fromToken.weiAmount.gt(allowance);
    }

    public async approve(options: BasicTransactionOptions): Promise<TransactionReceipt> {
        if (!(await this.needApprove())) {
            throw new UnnecessaryApprove();
        }

        this.checkWalletConnected();
        this.checkBlockchainCorrect();

        return Injector.web3Private.approveTokens(
            this.fromTrade.fromToken.address,
            this.fromTrade.contract.address,
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
            this.fromTrade.fromToken.address,
            this.fromTrade.contract.address,
            'infinity',
            txOptions
        );
    }

    public abstract swap(options?: SwapTransactionOptions): Promise<string | never>;

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
        if (Injector.web3Private.blockchainName !== this.fromTrade.blockchain) {
            throw new WrongNetworkError();
        }
    }

    protected async checkContractsState(): Promise<void> {
        const [sourceContractPaused, targetContractPaused] = await Promise.all([
            this.fromTrade.contract.isPaused(),
            this.toTrade.contract.isPaused()
        ]);

        if (sourceContractPaused || targetContractPaused) {
            throw new CrossChainIsUnavailableError();
        }
    }

    protected checkUserBalance(): Promise<void | never> {
        return this.fromWeb3Public.checkBalance(
            this.fromTrade.fromToken,
            this.fromTrade.fromToken.tokenAmount,
            this.walletAddress
        );
    }

    protected abstract getContractParams(fromAddress?: string): Promise<ContractParams>;

    protected async checkToBlockchainGasPrice(): Promise<void | never> {
        if (this.toTrade.blockchain !== BLOCKCHAIN_NAME.ETHEREUM) {
            return;
        }

        const [maxGasPrice, currentGasPrice] = await Promise.all([
            this.toTrade.contract.getMaxGasPrice(),
            Injector.gasPriceApi.getGasPriceInEthUnits(this.toTrade.blockchain)
        ]);
        if (maxGasPrice.lt(currentGasPrice)) {
            throw new MaxGasPriceOverflowError();
        }
    }

    protected async checkToContractBalance(): Promise<void | never> {
        return this.toWeb3Public.checkBalance(
            this.toTrade.fromToken,
            this.fromTrade.fromToken.tokenAmount,
            this.toTrade.contract.address
        );
    }
}
