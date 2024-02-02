import BigNumber from 'bignumber.js';
import { FailedToCheckForTransactionReceiptError, TooLowAmountError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { parseError } from 'src/common/utils/errors';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { GasPriceBN } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/models/gas-price';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { DlnApiService } from 'src/features/common/providers/dln/dln-api-service';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
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
import { DeBridgeCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/constants/debridge-cross-chain-supported-blockchain';
import { DebridgeEvmCrossChainTradeConstructor } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/debridge-cross-chain-trade-constructor';
import { TransactionRequest } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/transaction-request';
import { DlnEvmTransactionResponse } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/transaction-response';
import { convertGasDataToBN } from 'src/features/cross-chain/calculation-manager/utils/convert-gas-price';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

/**
 * Calculated DeBridge cross-chain trade.
 */
export class DebridgeEvmCrossChainTrade extends EvmCrossChainTrade {
    protected useProxyByDefault = false;

    /** @internal */
    public readonly transitAmount: BigNumber;

    public readonly maxTheoreticalAmount: BigNumber;

    private readonly cryptoFeeToken: PriceTokenAmount;

    private readonly transactionRequest: TransactionRequest;

    private readonly slippage: number;

    private readonly onChainTrade: EvmOnChainTrade | null;

    private latestFixedFee: string | null = null;

    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>,
        transactionRequest: TransactionRequest,
        feeInfo: FeeInfo,
        providerAddress: string,
        receiverAddress?: string
    ): Promise<GasData | null> {
        const fromBlockchain = from.blockchain as DeBridgeCrossChainSupportedBlockchain &
            EvmBlockchainName;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            let gasLimit: BigNumber | null;
            let gasDetails: GasPriceBN | BigNumber | null;
            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);

            if (feeInfo.rubicProxy?.fixedFee?.amount.gt(0)) {
                const { contractAddress, contractAbi, methodName, methodArguments, value } =
                    await new DebridgeEvmCrossChainTrade(
                        {
                            from,
                            to: toToken,
                            transactionRequest,
                            gasData: null,
                            priceImpact: 0,
                            allowanceTarget: '',
                            slippage: 0,
                            feeInfo,
                            transitAmount: new BigNumber(NaN),
                            toTokenAmountMin: new BigNumber(NaN),
                            maxTheoreticalAmount: new BigNumber(NaN),
                            cryptoFeeToken: from,
                            onChainTrade: null
                        },
                        providerAddress || EvmWeb3Pure.EMPTY_ADDRESS,
                        []
                    ).getContractParams({}, true);

                const [proxyGasLimit, proxyGasDetails] = await Promise.all([
                    web3Public.getEstimatedGas(
                        contractAbi,
                        contractAddress,
                        methodName,
                        methodArguments,
                        walletAddress,
                        value
                    ),
                    convertGasDataToBN(await Injector.gasPriceApi.getGasPrice(from.blockchain))
                ]);

                gasLimit = proxyGasLimit;
                gasDetails = proxyGasDetails;
            } else {
                const { tx } = await new DebridgeEvmCrossChainTrade(
                    {
                        from,
                        to: toToken,
                        transactionRequest,
                        gasData: null,
                        priceImpact: 0,
                        allowanceTarget: '',
                        slippage: 0,
                        feeInfo,
                        transitAmount: new BigNumber(NaN),
                        toTokenAmountMin: new BigNumber(NaN),
                        maxTheoreticalAmount: new BigNumber(NaN),
                        cryptoFeeToken: from,
                        onChainTrade: null
                    },
                    providerAddress || EvmWeb3Pure.EMPTY_ADDRESS,
                    []
                ).getTransactionRequest(receiverAddress, null, true);

                const defaultGasLimit = await web3Public.getEstimatedGasByData(
                    walletAddress,
                    tx.to,
                    {
                        data: tx.data,
                        value: tx.value
                    }
                );
                const defaultGasDetails = convertGasDataToBN(
                    await Injector.gasPriceApi.getGasPrice(from.blockchain)
                );

                gasLimit = defaultGasLimit;
                gasDetails = defaultGasDetails;
            }

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

    public readonly type = CROSS_CHAIN_TRADE_TYPE.DEBRIDGE;

    public readonly isAggregator = false;

    public readonly onChainSubtype = {
        from: ON_CHAIN_TRADE_TYPE.ONE_INCH,
        to: ON_CHAIN_TRADE_TYPE.ONE_INCH
    };

    public readonly bridgeType = BRIDGE_TYPE.DEBRIDGE;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<BlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly priceImpact: number | null;

    public readonly allowanceTarget: string;

    public readonly gasData: GasData | null;

    private get fromBlockchain(): DeBridgeCrossChainSupportedBlockchain & EvmBlockchainName {
        return this.from.blockchain as DeBridgeCrossChainSupportedBlockchain & EvmBlockchainName;
    }

    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : this.allowanceTarget;
    }

    public readonly feeInfo: FeeInfo;

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    constructor(
        crossChainTrade: DebridgeEvmCrossChainTradeConstructor,
        providerAddress: string,
        routePath: RubicStep[]
    ) {
        super(providerAddress, routePath);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.transactionRequest = crossChainTrade.transactionRequest;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.allowanceTarget = crossChainTrade.allowanceTarget || '';
        this.slippage = crossChainTrade.slippage;
        this.onChainTrade = crossChainTrade.onChainTrade;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.feeInfo = crossChainTrade.feeInfo;
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;

        this.transitAmount = crossChainTrade.transitAmount;
        this.maxTheoreticalAmount = crossChainTrade.maxTheoreticalAmount;
    }

    protected async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
        this.checkWalletConnected();
        await this.checkAllowanceAndApprove(options);
        let transactionHash: string;

        try {
            const { tx } = await this.getTransactionRequest(
                options?.receiverAddress,
                options?.directTransaction
            );
            const { data, value, to } = tx;
            const { onConfirm } = options;
            const onTransactionHash = (hash: string) => {
                if (onConfirm) {
                    onConfirm(hash);
                }
                transactionHash = hash;
            };
            await this.web3Private.trySendTransaction(to, {
                onTransactionHash,
                data,
                value,
                gas: options.gasLimit,
                gasPriceOptions: options.gasPriceOptions
            });

            return transactionHash!;
        } catch (err) {
            if (err?.error?.errorId === 'ERROR_LOW_GIVE_AMOUNT') {
                throw new TooLowAmountError();
            }
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw parseError(err);
        }
    }

    public async getContractParams(
        options: GetContractParamsOptions,
        skipAmountChangeCheck: boolean = false
    ): Promise<ContractParams> {
        const { tx, fixFee } = await this.getTransactionRequest(
            options?.receiverAddress,
            options?.directTransaction,
            skipAmountChangeCheck
        );
        const { data, value: providerValue, to } = tx;

        const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(options, {
            walletAddress: this.walletAddress,
            fromTokenAmount: this.from,
            toTokenAmount: this.to,
            srcChainTrade: null,
            providerAddress: this.providerAddress,
            type: `native:${this.type}`,
            fromAddress: this.walletAddress
        });
        const swapData =
            this.onChainTrade &&
            (await ProxyCrossChainEvmTrade.getSwapData(options, {
                walletAddress: this.walletAddress,
                contractAddress: rubicProxyContractAddress[this.from.blockchain].router,
                fromTokenAmount: this.from,
                toTokenAmount: this.onChainTrade.to,
                onChainEncodeFn: this.onChainTrade.encode.bind(this.onChainTrade)
            }));
        const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
            to,
            data! as string,
            this.fromBlockchain,
            this.fromContractAddress,
            fixFee
        );

        const methodArguments = swapData
            ? [bridgeData, swapData, providerData]
            : [bridgeData, providerData];

        const value = this.getSwapValue(providerValue);

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

    private async getTransactionRequest(
        receiverAddress?: string,
        transactionConfig?: EvmEncodeConfig | null,
        skipAmountChangeCheck: boolean = false
    ): Promise<{
        tx: {
            data: string;
            value: string;
            to: string;
        };
        fixFee: string;
    }> {
        if (transactionConfig && this.latestFixedFee) {
            return {
                tx: {
                    data: transactionConfig.data,
                    value: transactionConfig.value,
                    to: transactionConfig.to
                },
                fixFee: this.latestFixedFee
            };
        }
        const sameChain =
            BlockchainsInfo.getChainType(this.from.blockchain) ===
            BlockchainsInfo.getChainType(this.to.blockchain);
        const walletAddress = this.web3Private.address;
        const params = {
            ...this.transactionRequest,
            ...(receiverAddress && { dstChainTokenOutRecipient: receiverAddress }),
            // @TODO Check proxy when deBridge proxy returned
            senderAddress: walletAddress,
            srcChainRefundAddress: walletAddress,
            dstChainOrderAuthorityAddress: sameChain
                ? receiverAddress || walletAddress
                : receiverAddress!,
            srcChainOrderAuthorityAddress: sameChain
                ? receiverAddress || walletAddress
                : walletAddress,
            referralCode: '4350'
        };

        const { tx, estimation, fixFee } =
            await DlnApiService.fetchCrossChainSwapData<DlnEvmTransactionResponse>(params);
        this.latestFixedFee = Boolean(fixFee) ? fixFee : '0';

        if (!skipAmountChangeCheck) {
            this.checkAmountChange(tx, estimation.dstChainTokenOut.amount, this.to.stringWeiAmount);
        }

        return { tx, fixFee };
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: 0,
            routePath: this.routePath
        };
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        const usdCryptoFee = this.cryptoFeeToken.price.multipliedBy(
            this.cryptoFeeToken.tokenAmount
        );

        return fromUsd
            .plus(usdCryptoFee.isNaN() ? 0 : usdCryptoFee)
            .dividedBy(this.maxTheoreticalAmount);
    }

    public getUsdPrice(providerFeeToken?: BigNumber): BigNumber {
        let feeSum = new BigNumber(0);
        const providerFee = this.feeInfo.provider?.cryptoFee;

        if (providerFee) {
            feeSum = feeSum.plus(
                providerFee.amount.multipliedBy(providerFeeToken || providerFee.token.price)
            );
        }

        return this.to.price.multipliedBy(this.maxTheoreticalAmount).minus(feeSum);
    }
}
