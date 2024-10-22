import { FailedToCheckForTransactionReceiptError, RubicSdkError } from 'src/common/errors';
import { getGasOptions } from 'src/common/utils/options';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { ERC20_TOKEN_ABI } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/constants/erc-20-token-abi';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { MarkRequired } from 'ts-essentials';
import { TransactionConfig } from 'web3-core';

import { rubicProxyContractAddress } from '../constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from '../emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from '../emv-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from '../emv-cross-chain-trade/evm-cross-chain-trade';
import { GetContractParamsOptions } from '../models/get-contract-params-options';
import { RubicStep } from '../models/rubicStep';
import { ProxyCrossChainEvmTrade } from '../proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { CrossChainPaymentInfo, CrossChainTransferData } from './models/cross-chain-payment-info';

export abstract class CrossChainTransferTrade extends EvmCrossChainTrade {
    protected paymentInfo: CrossChainTransferData | null = null;

    public readonly onChainTrade: EvmOnChainTrade | null;

    protected get web3Private(): EvmWeb3Private {
        if (!BlockchainsInfo.isEvmBlockchainName(this.from.blockchain)) {
            throw new RubicSdkError('Cannot retrieve web3 private');
        }
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain);
    }

    constructor(
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean,
        onChainTrade: EvmOnChainTrade | null
    ) {
        super(providerAddress, routePath, useProxy);
        this.onChainTrade = onChainTrade;
    }

    public async getTransferTrade(receiverAddress: string): Promise<CrossChainPaymentInfo> {
        await this.setTransactionConfig(false, false, receiverAddress);
        if (!this.paymentInfo) {
            throw new Error('Deposit address is not set');
        }
        const extraField = this.paymentInfo.depositExtraIdName
            ? {
                  name: this.paymentInfo.depositExtraIdName,
                  value: this.paymentInfo.depositExtraId
              }
            : null;

        return {
            id: this.paymentInfo.id,
            depositAddress: this.paymentInfo.depositAddress,
            ...(extraField && { extraField })
        };
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        const res = await this.getPaymentInfo(receiverAddress || this.walletAddress);

        const toAmountWei = Web3Pure.toWei(res.toAmount, this.to.decimals);
        this.paymentInfo = res;

        const config: EvmEncodeConfig = { to: '', data: '', value: '' };

        if (this.from.isNative) {
            config.value = this.from.stringWeiAmount;
            config.data = '0x';
            config.to = this.paymentInfo.depositAddress;
        } else {
            const blockchainType = BlockchainsInfo.getChainType(this.from.blockchain);

            if (blockchainType === CHAIN_TYPE.EVM) {
                const encodedConfig = EvmWeb3Pure.encodeMethodCall(
                    this.from.address,
                    ERC20_TOKEN_ABI,
                    'transfer',
                    [this.paymentInfo.depositAddress, this.from.stringWeiAmount],
                    '0'
                );
                config.value = '0';
                config.to = this.from.address;
                config.data = encodedConfig.data;
            } else {
                config.value = '0';
                config.data = '0x';
                config.to = this.paymentInfo.depositAddress;
            }
        }

        return { config, amount: toAmountWei };
    }

    protected abstract getPaymentInfo(receiverAddress: string): Promise<CrossChainTransferData>;

    public async encode(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        if (!BlockchainsInfo.isEvmBlockchainName(this.from.blockchain)) {
            throw new RubicSdkError('Cannot encode trade for non-evm blockchain');
        }

        await this.checkFromAddress(options.fromAddress, true, this.type);
        await this.checkReceiverAddress(
            options.receiverAddress,
            !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain),
            this.type
        );

        const { gasLimit } = options;
        if (this.isProxyTrade) {
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
                    gas: gasLimit || this.gasData?.gasLimit.toFixed(0),
                    ...getGasOptions(options)
                }
            );
        }
        return this.setTransactionConfig(
            options?.skipAmountCheck || false,
            options?.useCacheData || false,
            options?.receiverAddress || this.walletAddress
        );
    }

    protected async getContractParams(
        options: MarkRequired<GetContractParamsOptions, 'receiverAddress'>,
        skipAmountChangeCheck?: boolean
    ): Promise<ContractParams> {
        await this.setTransactionConfig(
            skipAmountChangeCheck || false,
            options.useCacheData || false,
            options.receiverAddress
        );
        if (!this.paymentInfo) {
            throw new Error('Deposit address is not set');
        }

        const toToken = this.to.clone({ address: EvmWeb3Pure.EMPTY_ADDRESS });

        const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(
            {
                ...options,
                receiverAddress: this.walletAddress
            },
            {
                walletAddress: this.walletAddress,
                fromTokenAmount: this.from,
                toTokenAmount: toToken,
                srcChainTrade: this.onChainTrade,
                providerAddress: this.providerAddress,
                type: `native:${this.bridgeType}`,
                fromAddress: this.walletAddress
            }
        );

        const providerData = [this.paymentInfo.depositAddress];

        const swapData =
            this.onChainTrade &&
            (await ProxyCrossChainEvmTrade.getSwapData(options, {
                walletAddress: this.walletAddress,
                contractAddress: rubicProxyContractAddress[this.from.blockchain].router,
                fromTokenAmount: this.from,
                toTokenAmount: this.onChainTrade.to,
                onChainEncodeFn: this.onChainTrade.encode.bind(this.onChainTrade)
            }));

        const methodArguments = swapData
            ? [bridgeData, swapData, providerData]
            : [bridgeData, providerData];

        const value = this.getSwapValue();

        const transactionConfiguration = EvmWeb3Pure.encodeMethodCall(
            rubicProxyContractAddress[this.from.blockchain].router,
            evmCommonCrossChainAbi,
            this.methodName,
            methodArguments,
            value
        );
        const sendingToken = this.from.isNative ? [] : [this.from.address];
        const sendingAmount = this.from.isNative ? [] : [this.from.stringWeiAmount];

        return {
            contractAddress: rubicProxyContractAddress[this.from.blockchain].gateway,
            contractAbi: gatewayRubicCrossChainAbi,
            methodName: 'startViaRubic',
            methodArguments: [sendingToken, sendingAmount, transactionConfiguration.data],
            value
        };
    }

    public encodeApprove(): Promise<TransactionConfig> {
        throw new RubicSdkError(`Cannot encode approve for ${this.type}`);
    }

    public async needApprove(): Promise<boolean> {
        if (this.isProxyTrade) {
            return super.needApprove();
        }
        return false;
    }

    public async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
        if (!BlockchainsInfo.isEvmBlockchainName(this.from.blockchain)) {
            throw new RubicSdkError("For non-evm chains use 'getTransferTrade' method");
        }

        await this.checkTradeErrors();
        await this.checkReceiverAddress(
            options.receiverAddress,
            !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain),
            this.type
        );

        const { onConfirm, gasPriceOptions } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        try {
            await this.setTransactionConfig(
                false,
                options.useCacheData || false,
                options?.receiverAddress || this.walletAddress
            );
            if (!this.paymentInfo) {
                throw new Error('Deposit address is not set');
            }

            if (this.from.isNative) {
                await this.web3Private.trySendTransaction(this.paymentInfo.depositAddress, {
                    value: this.from.weiAmount,
                    onTransactionHash,
                    gasPriceOptions
                });
            } else {
                await this.web3Private.tryExecuteContractMethod(
                    this.from.address,
                    ERC20_TOKEN_ABI,
                    'transfer',
                    [this.paymentInfo.depositAddress, this.from.stringWeiAmount],
                    {
                        onTransactionHash,
                        gasPriceOptions
                    }
                );
            }

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw err;
        }
    }

    protected async setTransactionConfig(
        skipAmountChangeCheck: boolean,
        useCacheData: boolean,
        receiverAddress?: string
    ): Promise<EvmEncodeConfig> {
        if (this.lastTransactionConfig && useCacheData) {
            return this.lastTransactionConfig;
        }

        const { config, amount } = await this.getTransactionConfigAndAmount(
            receiverAddress || this.walletAddress
        );
        this.lastTransactionConfig = config;
        setTimeout(() => {
            this.lastTransactionConfig = null;
        }, 15_000);

        if (!skipAmountChangeCheck) {
            this.checkAmountChange(amount, this.to.stringWeiAmount);
        }
        return config;
    }
}