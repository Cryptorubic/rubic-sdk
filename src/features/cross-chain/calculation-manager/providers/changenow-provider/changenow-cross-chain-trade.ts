import BigNumber from 'bignumber.js';
import { FailedToCheckForTransactionReceiptError, RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { getGasOptions } from 'src/common/utils/options';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { ERC20_TOKEN_ABI } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/constants/erc-20-token-abi';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
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
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { MarkRequired } from 'ts-essentials';
import { TransactionConfig } from 'web3-core';

import { convertGasDataToBN } from '../../utils/convert-gas-price';
import { ChangenowSwapRequestBody, ChangenowSwapResponse } from './models/changenow-swap.api';
import { ChangeNowCrossChainApiService } from './services/changenow-cross-chain-api-service';

export class ChangenowCrossChainTrade extends EvmCrossChainTrade {
    /** @internal */
    public static async getGasData(
        changenowTrade: ChangenowTrade,
        providerAddress: string,
        receiverAddress?: string
    ): Promise<GasData | null> {
        const fromBlockchain = changenowTrade.from.blockchain;
        const walletAddress =
            BlockchainsInfo.isEvmBlockchainName(fromBlockchain) &&
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new ChangenowCrossChainTrade(
                    changenowTrade,
                    providerAddress || EvmWeb3Pure.EMPTY_ADDRESS,
                    []
                ).getContractParams({ receiverAddress: receiverAddress || walletAddress }, true);

            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
            const [gasLimit, gasDetails] = await Promise.all([
                web3Public.getEstimatedGas(
                    contractAbi,
                    contractAddress,
                    methodName,
                    methodArguments,
                    walletAddress,
                    value
                ),
                convertGasDataToBN(await Injector.gasPriceApi.getGasPrice(fromBlockchain))
            ]);

            if (!gasLimit?.isFinite()) {
                return null;
            }

            const increasedGasLimit = Web3Pure.calculateGasMargin(gasLimit, 1.2);
            return {
                gasLimit: increasedGasLimit,
                ...gasDetails
            };
        } catch (_err) {
            return null;
        }
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

    /**
     * id of changenow trade, used to get trade status.
     */
    public id: string | undefined;

    /* used in web3Private.trySendTransaction when rate updated */
    private txTo!: string;

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
            return Web3Pure.fromWei(this.gasData.gasPrice).multipliedBy(this.gasData.gasLimit);
        }

        return null;
    }

    constructor(crossChainTrade: ChangenowTrade, providerAddress: string, routePath: RubicStep[]) {
        super(providerAddress, routePath);

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
            throw new RubicSdkError("For non-evm chains use 'getChangenowPostTrade' method");
        }

        await this.checkTradeErrors();
        await this.checkReceiverAddress(
            options.receiverAddress,
            !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain),
            CROSS_CHAIN_TRADE_TYPE.CHANGENOW
        );

        const { onConfirm, gasLimit, gasPrice, gasPriceOptions } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        try {
            await this.checkTradeErrors();

            if (!options.directTransaction) {
                const { id, payinAddress } = await this.getPaymentInfo(
                    this.transitToken.tokenAmount,
                    options.receiverAddress ? options.receiverAddress : this.walletAddress,
                    false
                );
                this.id = id;
                this.txTo = payinAddress;
            }

            if (this.from.isNative) {
                await this.web3Private.trySendTransaction(this.txTo, {
                    value: this.from.weiAmount,
                    onTransactionHash,
                    gasPrice,
                    gasPriceOptions
                });
            } else {
                await this.web3Private.tryExecuteContractMethod(
                    this.from.address,
                    ERC20_TOKEN_ABI,
                    'transfer',
                    [this.txTo, this.from.stringWeiAmount],
                    {
                        onTransactionHash,
                        gas: gasLimit,
                        gasPrice,
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
        const paymentInfo = await this.getPaymentInfo(this.from.tokenAmount, receiverAddress);
        const extraField = paymentInfo.payinExtraIdName
            ? {
                  name: paymentInfo.payinExtraIdName,
                  value: paymentInfo.payinExtraId
              }
            : null;

        return {
            id: paymentInfo.id,
            depositAddress: paymentInfo.payinAddress,
            ...(extraField && { extraField })
        };
    }

    private async getPaymentInfo(
        fromAmount: BigNumber,
        receiverAddress: string,
        skipAmountChangeCheck: boolean = false
    ): Promise<ChangenowSwapResponse> {
        const params: ChangenowSwapRequestBody = {
            fromCurrency: this.fromCurrency.ticker,
            toCurrency: this.toCurrency.ticker,
            fromNetwork: this.fromCurrency.network,
            toNetwork: this.toCurrency.network,
            fromAmount: fromAmount.toFixed(),
            address: receiverAddress,
            flow: 'standard'
        };

        const res = await ChangeNowCrossChainApiService.getSwapTx(params);
        const toAmountWei = Web3Pure.toWei(res.toAmount, this.to.decimals);

        if (!skipAmountChangeCheck) {
            // Mock EvmConfig cause CN doesn't provide tx-data
            EvmCrossChainTrade.checkAmountChange(
                { data: '', to: '', value: '' },
                toAmountWei,
                this.to.stringWeiAmount
            );
        }

        return res;
    }

    protected async getContractParams(
        options: MarkRequired<GetContractParamsOptions, 'receiverAddress'>,
        skipAmountChangeCheck?: boolean
    ): Promise<ContractParams> {
        const paymentInfo = await this.getPaymentInfo(
            this.transitToken.tokenAmount,
            options?.receiverAddress || this.walletAddress,
            skipAmountChangeCheck
        );
        this.id = paymentInfo.id;
        this.txTo = paymentInfo.payinAddress;

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

        const providerData = [paymentInfo.payinAddress];

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

    public async encode(options: EncodeTransactionOptions): Promise<TransactionConfig> {
        if (!BlockchainsInfo.isEvmBlockchainName(this.from.blockchain)) {
            throw new RubicSdkError('Cannot encode trade for non-evm blockchain');
        }

        await this.checkFromAddress(options.fromAddress, true, CROSS_CHAIN_TRADE_TYPE.CHANGENOW);
        await this.checkReceiverAddress(
            options.receiverAddress,
            !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain),
            CROSS_CHAIN_TRADE_TYPE.CHANGENOW
        );

        const { gasLimit } = options;

        const { contractAddress, contractAbi, methodName, methodArguments, value } =
            await this.getContractParams(
                {
                    fromAddress: options.fromAddress,
                    receiverAddress: options.receiverAddress || options.fromAddress
                },
                true
            );

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

    public encodeApprove(): Promise<TransactionConfig> {
        throw new RubicSdkError('Cannot encode approve for changenow');
    }

    public async needApprove(): Promise<boolean> {
        if (this.isProxyTrade) {
            return super.needApprove();
        }
        return false;
    }
}
