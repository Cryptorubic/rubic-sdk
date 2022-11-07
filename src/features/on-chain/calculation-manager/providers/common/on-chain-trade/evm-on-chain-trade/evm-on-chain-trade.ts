import { OnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/on-chain-trade';
import { PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { Injector } from 'src/core/injector/injector';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { TransactionReceipt } from 'web3-eth';
import {
    FailedToCheckForTransactionReceiptError,
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
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import {
    onChainProxyContractAbi,
    onChainProxyContractAddress
} from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/constants/on-chain-proxy-contract';
import { parseError } from 'src/common/utils/errors';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';

export abstract class EvmOnChainTrade extends OnChainTrade {
    public abstract readonly from: PriceTokenAmount<EvmBlockchainName>;

    public abstract readonly to: PriceTokenAmount<EvmBlockchainName>;

    /**
     * Gas fee info, including gas limit and gas price.
     */
    public abstract gasFeeInfo: GasFeeInfo | null;

    protected get web3Public(): EvmWeb3Public {
        return Injector.web3PublicService.getWeb3Public(this.from.blockchain);
    }

    protected get web3Private(): EvmWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain);
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
            this.contractAddress,
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

        const receiverAddress = options.receiverAddress || this.walletAddress;
        const directTransactionConfig = await this.encodeDirect({
            fromAddress: this.walletAddress,
            receiverAddress
        });
        const { gas, gasPrice } = directTransactionConfig;

        const contractAddress = onChainProxyContractAddress[this.from.blockchain];
        const methodName = this.from.isNative ? 'instantTradeNative' : 'instantTrade';
        const methodArguments = this.getProxyMethodArguments(
            receiverAddress,
            directTransactionConfig.data
        );
        const value = this.from.isNative ? this.from.stringWeiAmount : '0';

        try {
            await this.web3Private.tryExecuteContractMethod(
                contractAddress,
                onChainProxyContractAbi,
                methodName,
                methodArguments,
                { onTransactionHash, value, gas, gasPrice }
            );

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw parseError(err);
        }
    }

    public async encode(_options: EncodeTransactionOptions): Promise<TransactionConfig> {
        // @todo
        return {} as TransactionConfig;
    }

    private getProxyMethodArguments(receiverAddress: string, data: string): unknown[] {
        return [
            [
                this.from.address,
                this.from.stringWeiAmount,
                this.to.address,
                this.toTokenAmountMin.stringWeiAmount,
                receiverAddress,
                this.providerAddress,
                this.contractAddress
            ],
            data
        ];
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
            gas:
                (options.gasLimit === undefined ? calculatedGasFee.gasLimit : options.gasLimit) ||
                undefined,
            gasPrice:
                (options.gasPrice === undefined ? calculatedGasFee.gasPrice : options.gasPrice) ||
                undefined
        };
    }
}
