import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { GasPriceBN } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/models/gas-price';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';

import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from '../../models/cross-chain-trade-type';
import { convertGasDataToBN } from '../../utils/convert-gas-price';
import { rubicProxyContractAddress } from '../common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from '../common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from '../common/emv-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from '../common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE, BridgeType } from '../common/models/bridge-type';
import { FeeInfo } from '../common/models/fee-info';
import { GetContractParamsOptions } from '../common/models/get-contract-params-options';
import { OnChainSubtype } from '../common/models/on-chain-subtype';
import { TradeInfo } from '../common/models/trade-info';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { RangoContractAddresses } from './constants/rango-contract-address';
import { RangoCrossChainSupportedBlockchain } from './model/rango-cross-chain-supported-blockchains';
import {
    RangoCrossChainTradeConstructorParams,
    RangoGetGasDataParams,
    RangoSwapQueryParams
} from './model/rango-parser-types';
import { RangoApiService } from './services/rango-cross-chain-api-service';

export class RangoCrossChainTrade extends EvmCrossChainTrade {
    /** @internal */
    public static async getGasData({
        fromToken,
        toToken,
        feeInfo,
        routePath,
        swapQueryParams
    }: RangoGetGasDataParams): Promise<GasData | null> {
        const fromBlockchain = fromToken.blockchain;
        const walletAddress = swapQueryParams.fromAddress;

        if (!walletAddress) {
            return null;
        }
        try {
            let gasLimit: BigNumber | null;
            let gasDetails: GasPriceBN | BigNumber | null;
            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);

            const tradeParams = {
                crossChainTrade: {
                    from: fromToken,
                    to: toToken,
                    toTokenAmountMin: new BigNumber(0),
                    feeInfo,
                    gasData: null,
                    priceImpact: fromToken.calculatePriceImpactPercent(toToken) || 0,
                    slippage: swapQueryParams.slippage,
                    swapQueryParams
                },
                routePath,
                providerAddress: swapQueryParams.toAddress
            } as RangoCrossChainTradeConstructorParams;

            if (feeInfo.rubicProxy?.fixedFee?.amount.gt(0)) {
                const { contractAddress, contractAbi, methodName, methodArguments, value } =
                    await new RangoCrossChainTrade(tradeParams).getContractParams(
                        {
                            receiverAddress: swapQueryParams.toAddress
                        },
                        true
                    );

                const [proxyGasLimit, proxyGasDetails] = await Promise.all([
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

                gasLimit = proxyGasLimit;
                gasDetails = proxyGasDetails;
            } else {
                const { data, value, to } = await new RangoCrossChainTrade(
                    tradeParams
                ).getTransactionRequest(undefined, true);

                const defaultGasLimit = await web3Public.getEstimatedGasByData(walletAddress, to, {
                    data,
                    value
                });
                const defaultGasDetails = convertGasDataToBN(
                    await Injector.gasPriceApi.getGasPrice(fromBlockchain)
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
        } catch (err) {
            return null;
        }
        return null;
    }

    /**ABSTRACT PROPS */
    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.RANGO;

    public readonly isAggregator: boolean = true;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType: BridgeType = BRIDGE_TYPE.RANGO;

    public readonly gasData: GasData;

    public readonly priceImpact: number | null;

    private readonly slippage: number;
    /** */

    /**
     * @description UUID returned by rango-api to track transaction status in getRangoDstSwapStatus
     */
    public readonly rangoRequestId: string;

    private readonly swapQueryParams: RangoSwapQueryParams;

    private get fromBlockchain(): RangoCrossChainSupportedBlockchain {
        return this.from.blockchain as RangoCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : RangoContractAddresses[this.fromBlockchain].providerGateway;
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    constructor(params: RangoCrossChainTradeConstructorParams) {
        super(params.providerAddress, params.routePath);
        this.to = params.crossChainTrade.to;
        this.from = params.crossChainTrade.from;
        this.toTokenAmountMin = params.crossChainTrade.toTokenAmountMin;
        this.feeInfo = params.crossChainTrade.feeInfo;
        this.gasData = params.crossChainTrade.gasData;
        this.priceImpact = params.crossChainTrade.priceImpact;
        this.slippage = params.crossChainTrade.slippage;
        this.swapQueryParams = params.crossChainTrade.swapQueryParams;
        this.rangoRequestId = params.crossChainTrade.rangoRequestId;
    }

    public async getContractParams(
        options: GetContractParamsOptions,
        skipAmountChangeCheck: boolean = false
    ): Promise<ContractParams> {
        const receiverAddress = options?.receiverAddress || this.walletAddress;

        const {
            data,
            value: providerValue,
            to: providerRouter
        } = await this.getTransactionRequest(options.directTransaction, skipAmountChangeCheck);

        const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(options, {
            walletAddress: receiverAddress,
            fromTokenAmount: this.from,
            toTokenAmount: this.to,
            srcChainTrade: null,
            providerAddress: this.providerAddress,
            type: `native:${this.type}`,
            fromAddress: this.walletAddress
        });

        const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
            providerRouter,
            data!,
            this.from.blockchain,
            providerRouter,
            '0'
        );

        const methodArguments = [bridgeData, providerData];
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

    protected async swapDirect(options: SwapTransactionOptions = {}): Promise<string> {
        if (!BlockchainsInfo.isEvmBlockchainName(this.from.blockchain)) {
            throw new RubicSdkError("For non-evm chains use 'getChangenowPostTrade' method");
        }

        await this.checkTradeErrors();
        await this.checkAllowanceAndApprove(options);

        const { onConfirm, gasLimit, gasPrice, gasPriceOptions } = options;
        let transactionHash: string;

        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        // eslint-disable-next-line no-useless-catch
        try {
            const { data, value, to } = await this.getTransactionRequest(options.directTransaction);

            await this.web3Private.trySendTransaction(to, {
                data,
                value,
                onTransactionHash,
                gas: gasLimit,
                gasPrice,
                gasPriceOptions
            });

            return transactionHash!;
        } catch (err) {
            throw err;
        }
    }

    private async getTransactionRequest(
        transactionConfig?: EvmEncodeConfig,
        skipAmountChangeCheck: boolean = false
    ): Promise<EvmEncodeConfig> {
        if (transactionConfig) {
            return {
                data: transactionConfig.data,
                to: transactionConfig.to,
                value: transactionConfig.value
            };
        }

        const { route, tx, error } = await RangoApiService.getSwapTransaction(this.swapQueryParams);

        if (!route || !tx) {
            throw new RubicSdkError('Invalid data after sending swap request. Error text:' + error);
        }

        const config = {
            data: tx.txData!,
            value: tx.value || '0',
            to: tx.txTo
        };

        if (!skipAmountChangeCheck) {
            EvmCrossChainTrade.checkAmountChange(
                config,
                route.outputAmount,
                this.to.stringWeiAmount
            );
        }
        return config;
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact || null,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }

    /**
     * @deprecated
     */
    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd;
    }
}
