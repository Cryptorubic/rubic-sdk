import BigNumber from 'bignumber.js';
import { FailedToCheckForTransactionReceiptError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { Cache } from 'src/common/utils/decorators';
import { parseError } from 'src/common/utils/errors';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { GasPriceBN } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/models/gas-price';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { rubicProxyAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { SquidrouterContractAddress } from 'src/features/cross-chain/calculation-manager/providers/squidrouter-provider/constants/squidrouter-contract-address';
import { SquidrouterCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/squidrouter-provider/constants/squidrouter-cross-chain-supported-blockchain';
import { SquidrouterTransactionRequest } from 'src/features/cross-chain/calculation-manager/providers/squidrouter-provider/models/transaction-request';
import { SquidrouterTransactionResponse } from 'src/features/cross-chain/calculation-manager/providers/squidrouter-provider/models/transaction-response';
import { SquidrouterCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/squidrouter-provider/squidrouter-cross-chain-provider';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

import { convertGasDataToBN } from '../../utils/convert-gas-price';

/**
 * Calculated DeBridge cross-chain trade.
 */
export class SquidrouterCrossChainTrade extends EvmCrossChainTrade {
    /** @internal */
    public readonly transitUSDAmount: BigNumber;

    private readonly cryptoFeeToken: PriceTokenAmount;

    private readonly slippage: number;

    private readonly onChainTrade: EvmOnChainTrade | null;

    private readonly transactionRequest: SquidrouterTransactionRequest;

    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>,
        transactionRequest: SquidrouterTransactionRequest,
        feeInfo: FeeInfo,
        receiverAddress: string,
        providerAddress: string
    ): Promise<GasData | null> {
        const fromBlockchain = from.blockchain as SquidrouterCrossChainSupportedBlockchain;
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
                    await new SquidrouterCrossChainTrade(
                        {
                            from,
                            to: toToken,
                            gasData: null,
                            priceImpact: 0,
                            allowanceTarget: '',
                            slippage: 0,
                            feeInfo,
                            transitUSDAmount: new BigNumber(NaN),
                            cryptoFeeToken: from,
                            onChainTrade: null,
                            onChainSubtype: { from: undefined, to: undefined },
                            transactionRequest
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
                const { data, value, to } = await new SquidrouterCrossChainTrade(
                    {
                        from,
                        to: toToken,
                        gasData: null,
                        priceImpact: 0,
                        allowanceTarget: '',
                        slippage: 0,
                        feeInfo,
                        transitUSDAmount: new BigNumber(NaN),
                        cryptoFeeToken: from,
                        onChainTrade: null,
                        onChainSubtype: { from: undefined, to: undefined },
                        transactionRequest
                    },
                    providerAddress || EvmWeb3Pure.EMPTY_ADDRESS,
                    []
                ).getTransactionRequest(receiverAddress, null, true);

                const defaultGasLimit = await web3Public.getEstimatedGasByData(walletAddress, to, {
                    data,
                    value
                });
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

    public readonly type = CROSS_CHAIN_TRADE_TYPE.SQUIDROUTER;

    public readonly isAggregator = false;

    public readonly onChainSubtype: OnChainSubtype = {
        from: undefined,
        to: undefined
    };

    public readonly bridgeType = BRIDGE_TYPE.SQUIDROUTER;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly priceImpact: number | null;

    public readonly allowanceTarget: string;

    public readonly gasData: GasData | null;

    private get fromBlockchain(): SquidrouterCrossChainSupportedBlockchain {
        return this.from.blockchain as SquidrouterCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : SquidrouterContractAddress[this.fromBlockchain].providerGateway;
    }

    public readonly feeInfo: FeeInfo;

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            gasData: GasData | null;
            priceImpact: number | null;
            allowanceTarget: string;
            slippage: number;
            feeInfo: FeeInfo;
            transitUSDAmount: BigNumber;
            cryptoFeeToken: PriceTokenAmount;
            onChainTrade: EvmOnChainTrade | null;
            onChainSubtype: OnChainSubtype;
            transactionRequest: SquidrouterTransactionRequest;
        },
        providerAddress: string,
        routePath: RubicStep[]
    ) {
        super(providerAddress, routePath);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.allowanceTarget = crossChainTrade.allowanceTarget;
        this.slippage = crossChainTrade.slippage;
        this.onChainTrade = crossChainTrade.onChainTrade;
        this.toTokenAmountMin = this.to.tokenAmount.multipliedBy(1 - crossChainTrade.slippage);
        this.feeInfo = crossChainTrade.feeInfo;
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;
        this.onChainSubtype = crossChainTrade.onChainSubtype;
        this.transactionRequest = crossChainTrade.transactionRequest;
        this.transitUSDAmount = crossChainTrade.transitUSDAmount;
    }

    protected async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
        this.checkWalletConnected();
        await this.checkAllowanceAndApprove(options);
        let transactionHash: string;

        try {
            const { data, value, to } = await this.getTransactionRequest(
                options?.receiverAddress || this.walletAddress,
                options?.directTransaction
            );

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
                gasPrice: options.gasPrice,
                gasPriceOptions: options.gasPriceOptions
            });

            return transactionHash!;
        } catch (err) {
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
        const {
            data,
            value: providerValue,
            to
        } = await this.getTransactionRequest(
            options?.receiverAddress || this.walletAddress,
            options?.directTransaction,
            skipAmountChangeCheck
        );

        const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(options, {
            walletAddress: this.walletAddress,
            fromTokenAmount: this.from,
            toTokenAmount: this.to,
            srcChainTrade: this.onChainTrade,
            providerAddress: this.providerAddress,
            type: `native:${this.type}`,
            fromAddress: this.walletAddress
        });

        const extraNativeFee = this.from.isNative
            ? new BigNumber(providerValue).minus(this.from.stringWeiAmount).toFixed()
            : new BigNumber(providerValue).toFixed();
        const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
            to,
            data!,
            this.fromBlockchain,
            to,
            extraNativeFee
        );

        const methodArguments = [bridgeData, providerData];

        const value = this.getSwapValue(providerValue);

        const transactionConfiguration = EvmWeb3Pure.encodeMethodCall(
            rubicProxyContractAddress[this.from.blockchain].router,
            rubicProxyAbi,
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
        const usdCryptoFee = this.cryptoFeeToken.price.multipliedBy(
            this.cryptoFeeToken.tokenAmount
        );
        return fromUsd.plus(usdCryptoFee.isNaN() ? 0 : usdCryptoFee).dividedBy(this.to.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }

    private async getTransactionRequest(
        receiverAddress: string,
        transactionConfig?: EvmEncodeConfig | null,
        skipAmountChangeCheck: boolean = false
    ): Promise<EvmEncodeConfig> {
        if (transactionConfig) {
            return {
                data: transactionConfig.data,
                value: transactionConfig.value,
                to: transactionConfig.to
            };
        }
        const requestParams: SquidrouterTransactionRequest = {
            ...this.transactionRequest,
            toAddress: receiverAddress
        };

        const {
            route: { transactionRequest, estimate: routeEstimate }
        } = await SquidrouterCrossChainTrade.getResponseFromApiToTransactionRequest(requestParams);

        if (!skipAmountChangeCheck) {
            EvmCrossChainTrade.checkAmountChange(
                {
                    data: transactionRequest.data,
                    value: transactionRequest.value,
                    to: transactionRequest.targetAddress
                },
                routeEstimate.toAmount,
                this.to.stringWeiAmount
            );
        }

        return {
            data: transactionRequest.data,
            value: transactionRequest.value,
            to: transactionRequest.targetAddress
        };
    }

    @Cache({
        maxAge: 15_000
    })
    public static async getResponseFromApiToTransactionRequest(
        requestParams: SquidrouterTransactionRequest
    ): Promise<SquidrouterTransactionResponse> {
        return Injector.httpClient.get<SquidrouterTransactionResponse>(
            `${SquidrouterCrossChainProvider.apiEndpoint}route`,
            {
                params: requestParams as unknown as {},
                headers: {
                    'x-integrator-id': 'rubic-api'
                }
            }
        );
    }
}
