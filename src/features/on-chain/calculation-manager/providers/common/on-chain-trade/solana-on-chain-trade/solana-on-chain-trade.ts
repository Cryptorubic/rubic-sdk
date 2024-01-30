import BigNumber from 'bignumber.js';
import { UpdatedRatesError } from 'src/common/errors/cross-chain/updated-rates-error';
import { PriceTokenAmount, Token } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { BLOCKCHAIN_NAME, SolanaBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmBasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-basic-transaction-options';
import { EvmTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-transaction-options';
import { SolanaWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/solana-web3-private/solana-web3-private';
import { SolanaWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/solana-web3-public/solana-web3-public';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { IsDeflationToken } from 'src/features/deflation-token-manager/models/is-deflation-token';
import { OnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import {
    OptionsGasParams,
    TransactionGasParams
} from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-params';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/on-chain-trade';
import { TransactionConfig } from 'web3-core';
import { TransactionReceipt } from 'web3-eth';
import { utf8ToHex } from 'web3-utils';

export abstract class SolanaOnChainTrade extends OnChainTrade {
    public readonly from: PriceTokenAmount<SolanaBlockchainName>;

    public readonly to: PriceTokenAmount<SolanaBlockchainName>;

    public readonly slippageTolerance: number;

    public readonly path: ReadonlyArray<Token>;

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

    public abstract readonly dexContractAddress: string; // not static because https://github.com/microsoft/TypeScript/issues/34516

    private readonly usedForCrossChain: boolean;

    protected get spenderAddress(): string {
        return this.useProxy || this.usedForCrossChain
            ? rubicProxyContractAddress[this.from.blockchain].gateway
            : this.dexContractAddress;
    }

    protected get web3Public(): SolanaWeb3Public {
        return Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.SOLANA);
    }

    protected get web3Private(): SolanaWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(BLOCKCHAIN_NAME.SOLANA);
    }

    protected constructor(
        evmOnChainTradeStruct: OnChainTradeStruct<SolanaBlockchainName>,
        providerAddress: string
    ) {
        super(providerAddress);

        this.from = evmOnChainTradeStruct.from;
        this.to = evmOnChainTradeStruct.to;

        this.slippageTolerance = evmOnChainTradeStruct.slippageTolerance;
        this.path = evmOnChainTradeStruct.path;

        this.gasFeeInfo = evmOnChainTradeStruct.gasFeeInfo;

        this.useProxy = evmOnChainTradeStruct.useProxy;
        this.fromWithoutFee = evmOnChainTradeStruct.fromWithoutFee;
        this.usedForCrossChain = evmOnChainTradeStruct.usedForCrossChain || false;

        this.feeInfo = {
            rubicProxy: {
                ...(evmOnChainTradeStruct.proxyFeeInfo?.fixedFeeToken && {
                    fixedFee: {
                        amount:
                            evmOnChainTradeStruct.proxyFeeInfo?.fixedFeeToken.tokenAmount ||
                            new BigNumber(0),
                        token: evmOnChainTradeStruct.proxyFeeInfo?.fixedFeeToken
                    }
                }),
                ...(evmOnChainTradeStruct.proxyFeeInfo?.platformFee && {
                    platformFee: {
                        percent: evmOnChainTradeStruct.proxyFeeInfo?.platformFee.percent || 0,
                        token: evmOnChainTradeStruct.proxyFeeInfo?.platformFee.token
                    }
                })
            }
        };
        this.withDeflation = evmOnChainTradeStruct.withDeflation;
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
            gasPrice: options?.gasPrice || undefined,
            gasPriceOptions: options?.gasPriceOptions || undefined
        };

        await this.approve(approveOptions, false);
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

    public async swap(_options: SwapTransactionOptions = {}): Promise<string | never> {
        throw new Error('Method is not supported');
        // await this.checkWalletState();
        // await this.checkAllowanceAndApprove(options);
        //
        // const { onConfirm, directTransaction } = options;
        // let transactionHash: string;
        // const onTransactionHash = (hash: string) => {
        //     if (onConfirm) {
        //         onConfirm(hash);
        //     }
        //     transactionHash = hash;
        // };
        //
        // const fromAddress = this.walletAddress;
        // const receiverAddress = options.receiverAddress || this.walletAddress;

        // try {
        //     const transactionConfig = await this.encode({
        //         fromAddress,
        //         receiverAddress,
        //         ...(directTransaction && { directTransaction }),
        //         ...(options?.referrer && { referrer: options?.referrer })
        //     });
        //
        //     let method: 'trySendTransaction' | 'sendTransaction' = 'trySendTransaction';
        //     if (options?.testMode) {
        //         console.info(transactionConfig, options.gasLimit, options.gasPrice);
        //         method = 'sendTransaction';
        //     }
        //     await this.web3Private[method](transactionConfig.to, {
        //         onTransactionHash,
        //         data: transactionConfig.data,
        //         value: transactionConfig.value,
        //         gas: options.gasLimit,
        //         gasPrice: options.gasPrice,
        //         gasPriceOptions: options.gasPriceOptions
        //     });
        //
        //     return transactionHash!;
        // } catch (err) {
        //     if (err instanceof FailedToCheckForTransactionReceiptError) {
        //         return transactionHash!;
        //     }
        //
        //     throw parseError(err);
        // }
    }

    public async encode(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);

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
        const swapData = await this.getSwapData(options);

        const receiverAddress = options.receiverAddress || options.fromAddress;
        const methodArguments = [
            EvmWeb3Pure.randomHex(32),
            this.providerAddress,
            SolanaOnChainTrade.getReferrerAddress(options.referrer),
            receiverAddress,
            this.toTokenAmountMin.stringWeiAmount,
            swapData
        ];

        const nativeToken = nativeTokensList[this.from.blockchain];
        const proxyFee = new BigNumber(this.feeInfo.rubicProxy?.fixedFee?.amount || '0');
        const value = Web3Pure.toWei(
            proxyFee.plus(this.from.isNative ? this.from.tokenAmount : '0'),
            nativeToken.decimals
        );

        const txConfig = EvmWeb3Pure.encodeMethodCall(
            rubicProxyContractAddress[this.from.blockchain].router,
            evmCommonCrossChainAbi,
            'swapTokensGeneric',
            methodArguments,
            value
        );

        const sendingToken = this.from.isNative ? [] : [this.from.address];
        const sendingAmount = this.from.isNative ? [] : [this.from.stringWeiAmount];

        return {
            contractAddress: rubicProxyContractAddress[this.from.blockchain].gateway,
            contractAbi: gatewayRubicCrossChainAbi,
            methodName: 'startViaRubic',
            methodArguments: [sendingToken, sendingAmount, txConfig.data],
            value
        };
    }

    private static getReferrerAddress(referrer: string | undefined): string {
        if (referrer) {
            return '0x' + utf8ToHex(referrer).slice(2, 42).padStart(40, '0');
        }

        return '0x0000000000000000000000000000000000000000';
    }

    /**
     * Encodes trade to swap it directly through dex contract.
     */
    public abstract encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig>;

    protected isDeflationError(): boolean {
        return (
            (this.withDeflation.from.isDeflation || this.withDeflation.to.isDeflation) &&
            this.slippageTolerance < 0.12
        );
    }

    protected getGasParams(
        options: OptionsGasParams,
        calculatedGasFee: OptionsGasParams = {
            gasLimit: this.gasFeeInfo?.gasLimit?.toFixed(),
            gasPrice: this.gasFeeInfo?.gasPrice?.toFixed()
        }
    ): TransactionGasParams {
        return {
            gas: options.gasLimit || calculatedGasFee.gasLimit,
            gasPrice: options.gasPrice || calculatedGasFee.gasPrice,
            maxPriorityFeePerGas:
                options.maxPriorityFeePerGas || calculatedGasFee.maxPriorityFeePerGas,
            maxFeePerGas: options.maxFeePerGas || calculatedGasFee.maxFeePerGas
        };
    }

    protected async getSwapData(_options: GetContractParamsOptions): Promise<unknown[]> {
        throw new Error('Method is not supported');
        // const directTransactionConfig = await this.encodeDirect({
        //     ...options,
        //     fromAddress: rubicProxyContractAddress[this.from.blockchain].router,
        //     supportFee: false,
        //     receiverAddress: rubicProxyContractAddress[this.from.blockchain].router
        // });
        // const availableDexs = (
        //     await ProxyCrossChainEvmTrade.getWhitelistedDexes(this.from.blockchain)
        // ).map(address => address.toLowerCase());
        //
        // const routerAddress = directTransactionConfig.to;
        // const method = directTransactionConfig.data.slice(0, 10);
        //
        // if (!availableDexs.includes(routerAddress.toLowerCase())) {
        //     throw new NotWhitelistedProviderError(routerAddress, undefined, 'dex');
        // }
        // await ProxyCrossChainEvmTrade.checkDexWhiteList(
        //     this.from.blockchain,
        //     routerAddress,
        //     method
        // );
        //
        // return [
        //     [
        //         routerAddress,
        //         routerAddress,
        //         this.from.address,
        //         this.to.address,
        //         this.from.stringWeiAmount,
        //         directTransactionConfig.data,
        //         true
        //     ]
        // ];
    }

    public static checkAmountChange(
        transactionRequest: EvmEncodeConfig,
        newWeiAmount: string,
        oldWeiAmount: string
    ): void {
        const oldAmount = new BigNumber(oldWeiAmount);
        const newAmount = new BigNumber(newWeiAmount);
        const changePercent = 0.1;
        const acceptablePercentPriceChange = new BigNumber(changePercent).dividedBy(100);

        const amountPlusPercent = oldAmount.multipliedBy(acceptablePercentPriceChange.plus(1));
        const amountMinusPercent = oldAmount.multipliedBy(
            new BigNumber(1).minus(acceptablePercentPriceChange)
        );

        const shouldThrowError =
            newAmount.lt(amountMinusPercent) || newAmount.gt(amountPlusPercent);

        if (shouldThrowError) {
            throw new UpdatedRatesError({
                ...transactionRequest,
                newAmount: newWeiAmount,
                oldAmount: oldWeiAmount
            });
        }
    }
}
