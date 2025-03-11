import { SwapRequestInterface } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import {
    FailedToCheckForTransactionReceiptError,
    RubicSdkError,
    TooLowAmountError,
    UserRejectError
} from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { parseError } from 'src/common/utils/errors';
import { BitcoinBlockchainName, BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { BitcoinWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/bitcoin-web3-private/bitcoin-web3-private';
import { BitcoinPsbtEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/bitcoin-web3-private/models/bitcoin-psbt-encoded-config';
import { BitcoinTransferEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/bitcoin-web3-private/models/bitcoin-transfer-encoded-config';
import { EvmBasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-basic-transaction-options';
import { EvmTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-transaction-options';
import { BitcoinWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/bitcoin-web3-public/bitcoin-web3-public';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { CrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { TransactionConfig } from 'web3-core';
import { TransactionReceipt } from 'web3-eth';

export abstract class BitcoinCrossChainTrade extends CrossChainTrade<
    BitcoinTransferEncodedConfig | BitcoinPsbtEncodedConfig
> {
    public abstract readonly from: PriceTokenAmount<BitcoinBlockchainName>;

    public abstract readonly memo: string;

    protected get fromWeb3Public(): BitcoinWeb3Public {
        return Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.BITCOIN);
    }

    protected get web3Private(): BitcoinWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(BLOCKCHAIN_NAME.BITCOIN);
    }

    /**
     * Gets gas fee in source blockchain.
     */
    public get estimatedGas(): BigNumber | null {
        return null;
    }

    public async approve(
        _options: EvmBasicTransactionOptions,
        _checkNeedApprove = true,
        _amount: BigNumber | 'infinity' = 'infinity'
    ): Promise<TransactionReceipt> {
        throw new Error('Method is not supported');
    }

    protected async checkAllowanceAndApprove(): Promise<void> {}

    /**
     *
     * @returns txHash(srcTxHash) | never
     */
    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        this.checkWalletConnected();
        let transactionHash: string;

        try {
            const txConfig = await this.setTransactionConfig(
                false,
                options?.useCacheData || false,
                options.testMode,
                options?.receiverAddress
            );

            const { onConfirm } = options;
            const onTransactionHash = (hash: string) => {
                if (onConfirm) {
                    onConfirm(hash);
                }
                transactionHash = hash;
            };
            const isPsbtTrade = 'psbt' in txConfig;

            if (isPsbtTrade) {
                await this.web3Private.sendPsbtTransaction(txConfig, { onTransactionHash });
            } else {
                await this.web3Private.transfer(txConfig, { onTransactionHash });
            }

            return transactionHash!;
        } catch (err) {
            if (err.message?.includes('User rejected the request') || err.code === 4001) {
                throw new UserRejectError();
            }
            if (err?.error?.errorId === 'ERROR_LOW_GIVE_AMOUNT') {
                throw new TooLowAmountError();
            }
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }

            throw parseError(err);
        }
    }

    public async encode(): Promise<TransactionConfig> {
        throw new Error("Method is not supported');");
    }

    public async encodeApprove(
        _tokenAddress: string,
        _spenderAddress: string,
        _value: BigNumber | 'infinity',
        _options: EvmTransactionOptions = {}
    ): Promise<TransactionConfig> {
        throw new Error('Method is not supported');
    }

    protected getContractParams(): Promise<ContractParams> {
        throw new Error('Method is not supported');
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

    protected async getTransactionConfigAndAmount(
        testMode?: boolean,
        receiverAddress?: string
    ): Promise<{
        config: BitcoinTransferEncodedConfig | BitcoinPsbtEncodedConfig;
        amount: string;
    }> {
        const swapRequestData: SwapRequestInterface = {
            ...this.apiQuote,
            fromAddress: this.walletAddress,
            receiver: receiverAddress,
            id: this.apiResponse.id,
            enableChecks: !testMode
        };
        const swapData = await Injector.rubicApiService.fetchSwapData<
            BitcoinTransferEncodedConfig | BitcoinPsbtEncodedConfig
        >(swapRequestData);
        const amount = swapData.estimate.destinationWeiAmount;

        return { config: swapData.transaction, amount };
    }

    public authWallet(): Promise<string> {
        throw new RubicSdkError('Method not implemented.');
    }
}
