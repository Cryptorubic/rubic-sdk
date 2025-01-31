import {
    QuoteRequestInterface,
    QuoteResponseInterface,
    SwapRequestInterface
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { FailedToCheckForTransactionReceiptError, RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { parseError } from 'src/common/utils/errors';
import { BLOCKCHAIN_NAME, SolanaBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmBasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-basic-transaction-options';
import { EvmTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-transaction-options';
import { SolanaWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/solana-web3-private/solana-web3-private';
import { SolanaWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/solana-web3-public/solana-web3-public';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { IsDeflationToken } from 'src/features/deflation-token-manager/models/is-deflation-token';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/common/on-chain-trade/on-chain-trade';
import { EvmEncodedConfigAndToAmount } from 'src/features/on-chain/calculation-manager/models/aggregator-on-chain-types';
import { TransactionConfig } from 'web3-core';
import { TransactionReceipt } from 'web3-eth';

import { SolanaOnChainTradeStruct } from './models/solana-on-chain-trade-struct';

export abstract class SolanaOnChainTrade extends OnChainTrade {
    protected lastTransactionConfig: EvmEncodeConfig | null = null;

    public readonly from: PriceTokenAmount<SolanaBlockchainName>;

    public readonly to: PriceTokenAmount<SolanaBlockchainName>;

    public readonly slippageTolerance: number;

    public readonly path: RubicStep[];

    /**
     * Gas fee info, including gas limit and gas price.
     */
    public readonly gasFeeInfo: GasFeeInfo | null;

    public readonly feeInfo: FeeInfo;

    /**
     * True, if trade must be swapped through on-chain proxy contract.
     */
    public readonly useProxy: boolean;

    /**
     * Contains from amount, from which proxy fees were subtracted.
     * If proxy is not used, then amount is equal to from amount.
     */
    protected readonly fromWithoutFee: PriceTokenAmount<SolanaBlockchainName>;

    protected readonly withDeflation: {
        from: IsDeflationToken;
        to: IsDeflationToken;
    };

    protected get spenderAddress(): string {
        throw new RubicSdkError('No spender address!');
    }

    public abstract readonly dexContractAddress: string; // not static because https://github.com/microsoft/TypeScript/issues/34516

    protected get web3Public(): SolanaWeb3Public {
        return Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.SOLANA);
    }

    protected get web3Private(): SolanaWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(BLOCKCHAIN_NAME.SOLANA);
    }

    private readonly apiQuote: QuoteRequestInterface | null = null;

    private readonly apiResponse: QuoteResponseInterface | null = null;

    protected constructor(tradeStruct: SolanaOnChainTradeStruct, providerAddress: string) {
        super(providerAddress);

        this.from = tradeStruct.from;
        this.to = tradeStruct.to;

        this.slippageTolerance = tradeStruct.slippageTolerance;
        this.path = tradeStruct.path;

        this.gasFeeInfo = tradeStruct.gasFeeInfo;

        this.useProxy = tradeStruct.useProxy;
        this.fromWithoutFee = tradeStruct.fromWithoutFee;

        this.apiQuote = tradeStruct?.apiQuote || null;
        this.apiResponse = tradeStruct?.apiResponse || null;

        this.feeInfo = {
            rubicProxy: {
                ...(tradeStruct.proxyFeeInfo?.fixedFeeToken && {
                    fixedFee: {
                        amount:
                            tradeStruct.proxyFeeInfo?.fixedFeeToken.tokenAmount || new BigNumber(0),
                        token: tradeStruct.proxyFeeInfo?.fixedFeeToken
                    }
                }),
                ...(tradeStruct.proxyFeeInfo?.platformFee && {
                    platformFee: {
                        percent: tradeStruct.proxyFeeInfo?.platformFee.percent || 0,
                        token: tradeStruct.proxyFeeInfo?.platformFee.token
                    }
                })
            }
        };
        this.withDeflation = tradeStruct.withDeflation;
    }

    public async approve(
        _options: EvmBasicTransactionOptions,
        _checkNeedApprove = true,
        _amount: BigNumber | 'infinity' = 'infinity'
    ): Promise<TransactionReceipt> {
        throw new Error('Method is not supported');
    }

    public async encodeApprove(
        _tokenAddress: string,
        _spenderAddress: string,
        _value: BigNumber | 'infinity',
        _options: EvmTransactionOptions = {}
    ): Promise<TransactionConfig> {
        throw new Error('Method is not supported');
    }

    protected async checkAllowanceAndApprove(): Promise<void> {
        throw new Error('Method is not supported');
    }

    /**
     * Calculates value for swap transaction.
     * @param providerValue Value, returned from cross-chain provider.
     */
    protected getSwapValue(providerValue?: BigNumber | string | number | null): string {
        const nativeToken = nativeTokensList[this.from.blockchain];
        const fixedFeeValue = Web3Pure.toWei(
            this.feeInfo.rubicProxy?.fixedFee?.amount || 0,
            nativeToken.decimals
        );

        let fromValue: BigNumber;
        if (this.from.isNative) {
            if (providerValue) {
                fromValue = new BigNumber(providerValue).dividedBy(
                    1 - (this.feeInfo.rubicProxy?.platformFee?.percent || 0) / 100
                );
            } else {
                fromValue = this.from.weiAmount;
            }
        } else {
            fromValue = new BigNumber(providerValue || 0);
        }

        return new BigNumber(fromValue).plus(fixedFeeValue).toFixed(0, 0);
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkWalletState(options?.testMode);

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

        const transactionConfig = await this.encode({
            fromAddress,
            receiverAddress,
            ...(options?.referrer && { referrer: options?.referrer })
        });

        try {
            await this.web3Private.sendTransaction({
                data: transactionConfig.data,
                onTransactionHash
            });

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }

            throw parseError(err);
        }
    }

    public async encode(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);

        return this.setTransactionConfig(options);
    }

    protected async getTransactionConfigAndAmount(
        options?: EncodeTransactionOptions
    ): Promise<EvmEncodedConfigAndToAmount> {
        if (!this.apiResponse || !this.apiQuote) {
            throw new Error('Failed to load api response');
        }
        const swapRequestData: SwapRequestInterface = {
            ...this.apiQuote,
            fromAddress: this.walletAddress,
            receiver: options?.receiverAddress || this.walletAddress,
            id: this.apiResponse.id
        };
        const swapData = await Injector.rubicApiService.fetchSwapData<EvmEncodeConfig>(
            swapRequestData
        );

        const config = {
            data: swapData.transaction.data!,
            value: swapData.transaction.value!,
            to: swapData.transaction.to!
        };

        const amount = swapData.estimate.destinationWeiAmount;

        return { tx: config, toAmount: amount };
    }

    protected async setTransactionConfig(
        options: EncodeTransactionOptions
    ): Promise<EvmEncodeConfig> {
        if (this.lastTransactionConfig && options.useCacheData) {
            return this.lastTransactionConfig;
        }

        const { tx, toAmount } = await this.getTransactionConfigAndAmount(options);
        this.lastTransactionConfig = tx;
        setTimeout(() => {
            this.lastTransactionConfig = null;
        }, 15_000);

        if (!options.skipAmountCheck) {
            this.checkAmountChange(toAmount, this.to.stringWeiAmount);
        }
        return tx;
    }
}
