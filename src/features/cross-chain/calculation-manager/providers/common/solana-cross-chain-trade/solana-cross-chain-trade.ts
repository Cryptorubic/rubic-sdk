import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { getGasOptions } from 'src/common/utils/options';
import { BLOCKCHAIN_NAME, SolanaBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { EvmBasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-basic-transaction-options';
import { EvmTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-transaction-options';
import { SolanaWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/solana-web3-private/solana-web3-private';
import { SolanaWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/solana-web3-public/solana-web3-public';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { CrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { TransactionConfig } from 'web3-core';
import { TransactionReceipt } from 'web3-eth';

export abstract class SolanaCrossChainTrade extends CrossChainTrade {
    public abstract readonly from: PriceTokenAmount<SolanaBlockchainName>;

    protected get fromWeb3Public(): SolanaWeb3Public {
        return Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.SOLANA);
    }

    protected get web3Private(): SolanaWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(BLOCKCHAIN_NAME.SOLANA);
    }

    /**
     * Gets gas fee in source blockchain.
     */
    public get estimatedGas(): BigNumber | null {
        return null;
        // if (!this.gasData) {
        //     return null;
        // }
        //
        // if (this.gasData.baseFee && this.gasData.maxPriorityFeePerGas) {
        //     return Web3Pure.fromWei(this.gasData.baseFee).plus(
        //         Web3Pure.fromWei(this.gasData.maxPriorityFeePerGas)
        //     );
        // }
        //
        // if (this.gasData.gasPrice) {
        //     return Web3Pure.fromWei(this.gasData.gasPrice).multipliedBy(this.gasData.gasLimit);
        // }
        //
        // return null;
    }

    public async approve(
        _options: EvmBasicTransactionOptions,
        _checkNeedApprove = true,
        _amount: BigNumber | 'infinity' = 'infinity'
    ): Promise<TransactionReceipt> {
        throw new Error('Solana is not implemented yet');
        // if (checkNeedApprove) {
        //     const needApprove = await this.needApprove();
        //     if (!needApprove) {
        //         throw new UnnecessaryApproveError();
        //     }
        // }
        //
        // this.checkWalletConnected();
        // await this.checkBlockchainCorrect();
        //
        // const approveAmount =
        //     this.from.blockchain === BLOCKCHAIN_NAME.GNOSIS ||
        //     this.from.blockchain === BLOCKCHAIN_NAME.CRONOS
        //         ? this.from.weiAmount
        //         : amount;
        //
        // const fromTokenAddress =
        //     this.from.isNative && this.from.blockchain === BLOCKCHAIN_NAME.METIS
        //         ? '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000'
        //         : this.from.address;
        //
        // return this.web3Private.approveTokens(
        //     fromTokenAddress,
        //     this.fromContractAddress,
        //     approveAmount,
        //     options
        // );
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
            gas: options?.approveGasLimit,
            gasPriceOptions: options?.gasPriceOptions
        };

        await this.approve(approveOptions, false);
    }

    protected abstract swapDirect(options?: SwapTransactionOptions): Promise<string | never>;

    /**
     *
     * @returns txHash(srcTxHash) | never
     */
    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        if (!this.isProxyTrade) {
            return this.swapDirect(options);
        }
        return this.swapWithParams(options);
    }

    private async swapWithParams(_options: SwapTransactionOptions = {}): Promise<string | never> {
        throw new Error('Solana is not implemented yet');
        // await this.checkTradeErrors();
        // await this.checkReceiverAddress(
        //     options.receiverAddress,
        //     !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain)
        // );
        //
        // await this.checkAllowanceAndApprove(options);
        //
        // const { onConfirm, gasLimit, gasPrice, gasPriceOptions } = options;
        // let transactionHash: string;
        // const onTransactionHash = (hash: string) => {
        //     if (onConfirm) {
        //         onConfirm(hash);
        //     }
        //     transactionHash = hash;
        // };
        //
        // const { contractAddress, contractAbi, methodName, methodArguments, value } =
        //     await this.getContractParams(options);
        //
        // try {
        //     let method: 'tryExecuteContractMethod' | 'executeContractMethod' =
        //         'tryExecuteContractMethod';
        //     if (options?.testMode) {
        //         console.info(
        //             contractAddress,
        //             contractAbi,
        //             methodName,
        //             methodName,
        //             value,
        //             gasLimit,
        //             gasPrice,
        //             gasPriceOptions
        //         );
        //         method = 'executeContractMethod';
        //     }
        //
        //     await this.web3Private[method](
        //         contractAddress,
        //         contractAbi,
        //         methodName,
        //         methodArguments,
        //         {
        //             value,
        //             onTransactionHash,
        //             gas: gasLimit,
        //             gasPrice,
        //             gasPriceOptions
        //         }
        //     );
        //
        //     return transactionHash!;
        // } catch (err) {
        //     if (err instanceof FailedToCheckForTransactionReceiptError) {
        //         return transactionHash!;
        //     }
        //     throw err;
        // }
    }

    public async encode(options: EncodeTransactionOptions): Promise<TransactionConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(
            options.receiverAddress,
            !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain)
        );

        const { gasLimit } = options;

        const { contractAddress, contractAbi, methodName, methodArguments, value } =
            await this.getContractParams({
                fromAddress: options.fromAddress,
                receiverAddress: options.receiverAddress || options.fromAddress
            });

        return EvmWeb3Pure.encodeMethodCall(
            contractAddress,
            contractAbi,
            methodName,
            methodArguments,
            value,
            {
                gas: gasLimit || '0',
                ...getGasOptions(options)
            }
        );
    }

    public async encodeApprove(
        _tokenAddress: string,
        _spenderAddress: string,
        _value: BigNumber | 'infinity',
        _options: EvmTransactionOptions = {}
    ): Promise<TransactionConfig> {
        throw new Error('Solana is not implemented yet');
        // return this.web3Private.encodeApprove(tokenAddress, spenderAddress, value, options);
    }

    protected abstract getContractParams(
        options: GetContractParamsOptions
    ): Promise<ContractParams>;

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
