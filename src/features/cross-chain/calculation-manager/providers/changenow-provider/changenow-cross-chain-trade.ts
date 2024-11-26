import BigNumber from 'bignumber.js';
import { FailedToCheckForTransactionReceiptError, RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { getGasOptions } from 'src/common/utils/options';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
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
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { ChangenowCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/constants/changenow-api-blockchain';
import { ChangenowCurrency } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-currencies-api';
import { ChangenowPaymentInfo } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-payment-info';
import { ChangenowTrade } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-trade';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { MarkRequired } from 'ts-essentials';
import { TransactionConfig } from 'web3-core';

import { TradeInfo } from '../common/models/trade-info';
import { ChangenowSwapRequestBody, ChangenowSwapResponse } from './models/changenow-swap.api';
import { ChangeNowCrossChainApiService } from './services/changenow-cross-chain-api-service';

export class ChangenowCrossChainTrade extends EvmCrossChainTrade {
    private paymentInfo: ChangenowSwapResponse | null = null;

    /**
     * used in rubic-app to send as changenow_id to backend
     */
    public get changenowId(): string {
        return this.paymentInfo ? this.paymentInfo.id : '';
    }

    protected get methodName(): string {
        return this.onChainTrade
            ? 'swapAndStartBridgeTokensViaTransfer'
            : 'startBridgeTokensViaTransfer';
    }

    public readonly type = CROSS_CHAIN_TRADE_TYPE.CHANGENOW;

    public readonly isAggregator = false;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<ChangenowCrossChainSupportedBlockchain>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype;

    public readonly bridgeType = BRIDGE_TYPE.CHANGENOW;

    public readonly priceImpact: number | null;

    private readonly fromCurrency: ChangenowCurrency;

    private readonly toCurrency: ChangenowCurrency;

    private get transitToken(): PriceTokenAmount {
        return this.onChainTrade ? this.onChainTrade.toTokenAmountMin : this.from;
    }

    protected get fromContractAddress(): string {
        if (this.isProxyTrade) {
            return rubicProxyContractAddress[this.from.blockchain].gateway;
        }
        throw new RubicSdkError('No contract address for changenow provider');
    }

    protected get web3Private(): EvmWeb3Private {
        if (!BlockchainsInfo.isEvmBlockchainName(this.from.blockchain)) {
            throw new RubicSdkError('Cannot retrieve web3 private');
        }
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain);
    }

    public readonly onChainTrade: EvmOnChainTrade | null;

    public get estimatedGas(): BigNumber | null {
        if (!this.gasData) {
            return null;
        }

        if (this.gasData.baseFee && this.gasData.maxPriorityFeePerGas) {
            return Web3Pure.fromWei(this.gasData.baseFee).plus(
                Web3Pure.fromWei(this.gasData.maxPriorityFeePerGas)
            );
        }

        if (this.gasData.gasPrice) {
            return Web3Pure.fromWei(this.gasData.gasPrice).multipliedBy(this.gasData.gasLimit ?? 0);
        }

        return null;
    }

    constructor(
        crossChainTrade: ChangenowTrade,
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean
    ) {
        super(providerAddress, routePath, useProxy);

        this.from = crossChainTrade.from as PriceTokenAmount<EvmBlockchainName>;
        this.to = crossChainTrade.to;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;

        this.fromCurrency = crossChainTrade.fromCurrency;
        this.toCurrency = crossChainTrade.toCurrency;

        this.feeInfo = crossChainTrade.feeInfo;
        this.gasData = crossChainTrade.gasData;

        this.priceImpact = this.from.calculatePriceImpactPercent(this.to);

        this.onChainSubtype = crossChainTrade.onChainTrade
            ? { from: crossChainTrade.onChainTrade.type, to: undefined }
            : { from: undefined, to: undefined };
        this.onChainTrade = crossChainTrade.onChainTrade;
    }

    public async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
        if (!BlockchainsInfo.isEvmBlockchainName(this.from.blockchain)) {
            throw new RubicSdkError("For non-evm networks use 'getChangenowPostTrade' method");
        }

        await this.checkTradeErrors();
        await this.checkReceiverAddress(
            options.receiverAddress,
            !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain),
            CROSS_CHAIN_TRADE_TYPE.CHANGENOW
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
                throw new Error('Payin address is not set');
            }

            if (this.from.isNative) {
                await this.web3Private.trySendTransaction(this.paymentInfo.payinAddress, {
                    value: this.from.weiAmount,
                    onTransactionHash,
                    gasPriceOptions
                });
            } else {
                await this.web3Private.tryExecuteContractMethod(
                    this.from.address,
                    ERC20_TOKEN_ABI,
                    'transfer',
                    [this.paymentInfo.payinAddress, this.from.stringWeiAmount],
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

    public async getChangenowPostTrade(receiverAddress: string): Promise<ChangenowPaymentInfo> {
        await this.setTransactionConfig(false, false, receiverAddress);
        if (!this.paymentInfo) {
            throw new Error('Payin address is not set');
        }
        const extraField = this.paymentInfo.payinExtraIdName
            ? {
                  name: this.paymentInfo.payinExtraIdName,
                  value: this.paymentInfo.payinExtraId
              }
            : null;

        return {
            id: this.paymentInfo.id,
            depositAddress: this.paymentInfo.payinAddress,
            ...(extraField && { extraField })
        };
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        const params: ChangenowSwapRequestBody = {
            fromCurrency: this.fromCurrency.ticker,
            toCurrency: this.toCurrency.ticker,
            fromNetwork: this.fromCurrency.network,
            toNetwork: this.toCurrency.network,
            fromAmount: this.transitToken.tokenAmount.toFixed(),
            address: receiverAddress,
            flow: 'standard'
        };

        const res = await ChangeNowCrossChainApiService.getSwapTx(params);
        const toAmountWei = Web3Pure.toWei(res.toAmount, this.to.decimals);
        this.paymentInfo = res;

        const config: EvmEncodeConfig = { to: '', data: '', value: '' };

        if (this.from.isNative) {
            config.value = this.from.stringWeiAmount;
            config.data = '0x';
            config.to = this.paymentInfo.payinAddress;
        } else {
            const blockchainType = BlockchainsInfo.getChainType(this.from.blockchain);

            if (blockchainType === CHAIN_TYPE.EVM) {
                const encodedConfig = EvmWeb3Pure.encodeMethodCall(
                    this.from.address,
                    ERC20_TOKEN_ABI,
                    'transfer',
                    [this.paymentInfo.payinAddress, this.from.stringWeiAmount],
                    '0'
                );
                config.value = '0';
                config.to = this.from.address;
                config.data = encodedConfig.data;
            } else {
                config.value = '0';
                config.data = '0x';
                config.to = this.paymentInfo.payinAddress;
            }
        }

        return { config, amount: toAmountWei };
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
            throw new Error('Payin address is not set');
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

        const providerData = [this.paymentInfo.payinAddress];

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

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: this.onChainTrade?.slippageTolerance
                ? this.onChainTrade.slippageTolerance * 100
                : 0,
            routePath: this.routePath
        };
    }

    public async encode(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        if (!BlockchainsInfo.isEvmBlockchainName(this.from.blockchain)) {
            throw new RubicSdkError('Cannot encode trade for non-evm blockchain');
        }

        await this.checkFromAddress(options.fromAddress, true, CROSS_CHAIN_TRADE_TYPE.CHANGENOW);
        await this.checkReceiverAddress(
            options.receiverAddress,
            !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain),
            CROSS_CHAIN_TRADE_TYPE.CHANGENOW
        );

        if (this.isProxyTrade) {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await this.getContractParams({
                    fromAddress: options.fromAddress,
                    receiverAddress: options.receiverAddress || options.fromAddress
                });
            const gasLimit = options.gasLimit || this.gasData?.gasLimit?.toFixed(0) || '0';

            return EvmWeb3Pure.encodeMethodCall(
                contractAddress,
                contractAbi,
                methodName,
                methodArguments,
                value,
                {
                    gas: gasLimit,
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

    public encodeApprove(): Promise<TransactionConfig> {
        throw new RubicSdkError('Cannot encode approve for changenow');
    }

    public async needApprove(): Promise<boolean> {
        if (this.isProxyTrade) {
            return super.needApprove();
        }
        return false;
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
