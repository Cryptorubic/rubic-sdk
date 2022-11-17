import { OnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/on-chain-trade';
import { PriceTokenAmount, Token } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { Injector } from 'src/core/injector/injector';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { TransactionReceipt } from 'web3-eth';
import {
    FailedToCheckForTransactionReceiptError,
    LowSlippageDeflationaryTokenError,
    RubicSdkError,
    UnnecessaryApproveError
} from 'src/common/errors';
import { EvmBasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-basic-transaction-options';
import BigNumber from 'bignumber.js';
import { EvmTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-transaction-options';
import { TransactionConfig } from 'web3-core';
import {
    OptionsGasParams,
    TransactionGasParams
} from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-params';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import {
    onChainProxyContractAbi,
    onChainProxyContractAddress
} from 'src/features/on-chain/calculation-manager/providers/common/on-chain-proxy-service/constants/on-chain-proxy-contract';
import { parseError } from 'src/common/utils/errors';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';

import { ContractParams } from 'src/features/common/models/contract-params';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';
import { EvmOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { IsDeflationToken } from 'src/features/deflation-token-manager/models/is-deflation-token';

export abstract class EvmOnChainTrade extends OnChainTrade {
    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly slippageTolerance: number;

    public readonly path: ReadonlyArray<Token>;

    /**
     * Gas fee info, including gas limit and gas price.
     */
    public readonly gasFeeInfo: GasFeeInfo | null;

    /**
     * True, if trade must be swapped through on-chain proxy contract.
     */
    protected readonly useProxy: boolean;

    public readonly proxyFeeInfo: OnChainProxyFeeInfo | undefined;

    /**
     * Contains from amount, from which proxy fees were subtracted.
     * If proxy is not used, then amount is equal to from amount.
     */
    protected readonly fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;

    protected readonly withDeflation: {
        from: IsDeflationToken;
        to: IsDeflationToken;
    };

    public abstract readonly dexContractAddress: string; // not static because https://github.com/microsoft/TypeScript/issues/34516

    private get contractAddress(): string {
        return this.useProxy
            ? onChainProxyContractAddress[this.from.blockchain]
            : this.dexContractAddress;
    }

    protected get spenderAddress(): string {
        return this.contractAddress;
    }

    protected get web3Public(): EvmWeb3Public {
        return Injector.web3PublicService.getWeb3Public(this.from.blockchain);
    }

    protected get web3Private(): EvmWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain);
    }

    protected constructor(evmOnChainTradeStruct: EvmOnChainTradeStruct, providerAddress: string) {
        super(providerAddress);

        this.from = evmOnChainTradeStruct.from;
        this.to = evmOnChainTradeStruct.to;

        this.slippageTolerance = evmOnChainTradeStruct.slippageTolerance;
        this.path = evmOnChainTradeStruct.path;

        this.gasFeeInfo = evmOnChainTradeStruct.gasFeeInfo;

        this.useProxy = evmOnChainTradeStruct.useProxy;
        this.proxyFeeInfo = evmOnChainTradeStruct.proxyFeeInfo;
        this.fromWithoutFee = evmOnChainTradeStruct.fromWithoutFee;

        this.withDeflation = evmOnChainTradeStruct.withDeflation;
    }

    public async approve(
        options: EvmBasicTransactionOptions,
        checkNeedApprove = true
    ): Promise<TransactionReceipt> {
        if (checkNeedApprove) {
            const needApprove = await this.needApprove();
            if (!needApprove) {
                throw new UnnecessaryApproveError();
            }
        }

        this.checkWalletConnected();
        await this.checkBlockchainCorrect();

        const approveAmount =
            this.from.blockchain === BLOCKCHAIN_NAME.GNOSIS ||
            this.from.blockchain === BLOCKCHAIN_NAME.CRONOS
                ? this.from.weiAmount
                : 'infinity';

        return this.web3Private.approveTokens(
            this.from.address,
            this.spenderAddress,
            approveAmount,
            options
        );
    }

    public async encodeApprove(
        tokenAddress: string,
        spenderAddress: string,
        value: BigNumber | 'infinity',
        options: EvmTransactionOptions = {}
    ): Promise<TransactionConfig> {
        return this.web3Private.encodeApprove(tokenAddress, spenderAddress, value, options);
    }

    protected async checkAllowanceAndApprove(
        options?: Omit<SwapTransactionOptions, 'onConfirm' | 'gasLimit'>
    ): Promise<void> {
        const needApprove = await this.needApprove();
        if (!needApprove) {
            return;
        }

        const approveOptions: EvmBasicTransactionOptions = {
            onTransactionHash: options?.onApprove,
            gas: options?.approveGasLimit || undefined,
            gasPrice: options?.gasPrice || undefined
        };

        await this.approve(approveOptions, false);
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkWalletState();
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
        const receiverAddress = options.receiverAddress || this.walletAddress;

        try {
            const transactionConfig = await this.encode({
                fromAddress,
                receiverAddress
            });
            await this.web3Private.sendTransaction(transactionConfig.to, {
                onTransactionHash,
                data: transactionConfig.data,
                value: transactionConfig.value,
                gas: options.gasLimit,
                gasPrice: options.gasPrice
            });

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }

            if (err instanceof RubicSdkError) {
                throw err;
            }
            if (
                (this.withDeflation.from.isDeflation || this.withDeflation.to.isDeflation) &&
                this.slippageTolerance < 0.12
            ) {
                throw new LowSlippageDeflationaryTokenError();
            }
            throw parseError(err);
        }
    }

    public async encode(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        this.checkFromAddress(options.fromAddress, true);
        this.checkReceiverAddress(options.receiverAddress);

        if (this.useProxy) {
            return this.encodeProxy(options);
        }
        return this.encodeDirect(options);
    }

    /**
     * Encodes trade to swap it through on-chain proxy.
     */
    private async encodeProxy(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        const { contractAddress, contractAbi, methodName, methodArguments, value } =
            await this.getProxyContractParams(options);
        const gasParams = this.getGasParams(options);

        return EvmWeb3Pure.encodeMethodCall(
            contractAddress,
            contractAbi,
            methodName,
            methodArguments,
            value,
            gasParams
        );
    }

    private async getProxyContractParams(
        options: EncodeTransactionOptions
    ): Promise<ContractParams> {
        const methodName = this.from.isNative ? 'instantTradeNative' : 'instantTrade';

        const directTransactionConfig = await this.encodeDirect({
            ...options,
            fromAddress: this.contractAddress,
            supportFee: false
        });
        const receiverAddress = options.receiverAddress || options.fromAddress;
        const methodArguments = [
            [
                this.from.address,
                this.from.stringWeiAmount,
                this.to.address,
                this.toTokenAmountMin.stringWeiAmount,
                receiverAddress,
                this.providerAddress,
                directTransactionConfig.to
            ],
            directTransactionConfig.data
        ];

        const value = new BigNumber(this.proxyFeeInfo?.fixedFeeToken.stringWeiAmount || 0)
            .plus(this.from.isNative ? this.from.weiAmount : '0')
            .toFixed(0);

        return {
            contractAddress: this.contractAddress,
            contractAbi: onChainProxyContractAbi,
            methodName,
            methodArguments,
            value
        };
    }

    /**
     * Encodes trade to swap it directly through dex contract.
     */
    public abstract encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig>;

    protected getGasParams(
        options: OptionsGasParams,
        calculatedGasFee: OptionsGasParams = {
            gasLimit: this.gasFeeInfo?.gasLimit?.toFixed(),
            gasPrice: this.gasFeeInfo?.gasPrice?.toFixed()
        }
    ): TransactionGasParams {
        return {
            gas: options.gasLimit || calculatedGasFee.gasLimit,
            gasPrice: options.gasPrice || calculatedGasFee.gasPrice
        };
    }
}
