import BigNumber from 'bignumber.js';
import { RubicSdkError, SwapRequestError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { Cache } from 'src/common/utils/decorators';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { BridgeType } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { LifiCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/constants/lifi-cross-chain-supported-blockchain';
import { LifiTransactionRequest } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/models/lifi-transaction-request';

import { LifiEvmCrossChainTradeConstructor } from '../models/lifi-cross-chain-trade-constructor';
import { Estimate } from '../models/lifi-fee-cost';
import { Route } from '../models/lifi-route';
import { LifiApiService } from '../services/lifi-api-service';

/**
 * Calculated Celer cross-chain trade.
 */
export class LifiEvmCrossChainTrade extends EvmCrossChainTrade {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.LIFI;

    public readonly isAggregator = true;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<BlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData | null;

    private readonly route: Route;

    private readonly providerGateway: string;

    public readonly onChainSubtype: OnChainSubtype;

    public readonly bridgeType: BridgeType;

    public readonly priceImpact: number | null;

    public readonly feeInfo: FeeInfo;

    private readonly slippage: number;

    private get fromBlockchain(): LifiCrossChainSupportedBlockchain {
        return this.from.blockchain as LifiCrossChainSupportedBlockchain;
    }

    public get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : this.providerGateway;
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    protected override get amountToCheck(): string {
        return Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals);
    }

    constructor(
        crossChainTrade: LifiEvmCrossChainTradeConstructor,
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean
    ) {
        super(providerAddress, routePath, useProxy);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.route = crossChainTrade.route;
        this.providerGateway = this.route.steps[0]!.estimate.approvalAddress;

        this.gasData = crossChainTrade.gasData;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.feeInfo = crossChainTrade.feeInfo;
        this.slippage = crossChainTrade.slippage;
        this.priceImpact = crossChainTrade.priceImpact;
        this.onChainSubtype = crossChainTrade.onChainSubtype;
        this.bridgeType = crossChainTrade.bridgeType;
    }

    protected async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
        try {
            await this.checkTradeErrors();
            if (options.receiverAddress) {
                throw new RubicSdkError('Receiver address not supported');
            }

            await this.checkAllowanceAndApprove(options);

            const { onConfirm, gasPriceOptions } = options;
            let transactionHash: string;
            const onTransactionHash = (hash: string) => {
                if (onConfirm) {
                    onConfirm(hash);
                }
                transactionHash = hash;
            };

            // eslint-disable-next-line no-useless-catch
            try {
                const { data, value, to } = await this.setTransactionConfig(
                    false,
                    options?.useCacheData || false,
                    options?.receiverAddress
                );

                await this.web3Private.trySendTransaction(to, {
                    data,
                    value,
                    onTransactionHash,
                    gasPriceOptions
                });

                return transactionHash!;
            } catch (err) {
                throw err;
            }
        } catch (err) {
            if ([400, 500, 503].includes(err.code)) {
                throw new SwapRequestError();
            }
            throw err;
        }
    }

    public async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const {
            data,
            value: providerValue,
            to: providerRouter
        } = await this.setTransactionConfig(
            false,
            options?.useCacheData || false,
            options?.receiverAddress
        );

        const isEvmDestination = BlockchainsInfo.isEvmBlockchainName(this.to.blockchain);
        const receivingAsset = isEvmDestination ? this.to.address : this.from.address;

        const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(options, {
            walletAddress: this.walletAddress,
            fromTokenAmount: this.from,
            toTokenAmount: this.to,
            srcChainTrade: null,
            providerAddress: this.providerAddress,
            type: `lifi:${this.bridgeType}`,
            fromAddress: this.walletAddress,
            toAddress: receivingAsset
        });

        const fromWithoutFee = getFromWithoutFee(
            this.from,
            this.feeInfo?.rubicProxy?.platformFee?.percent
        );
        const extraNativeFee = this.from.isNative
            ? new BigNumber(providerValue).minus(fromWithoutFee.stringWeiAmount).toFixed()
            : new BigNumber(providerValue).toFixed();

        const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
            providerRouter,
            data!,
            this.fromBlockchain as EvmBlockchainName,
            providerRouter,
            extraNativeFee
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

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        const firstStep = this.route.steps[0]!;
        const step = {
            ...firstStep,
            action: {
                ...firstStep.action,
                fromAddress: this.walletAddress,
                toAddress: receiverAddress || this.walletAddress
            },
            execution: {
                status: 'NOT_STARTED',
                process: [
                    {
                        message: 'Preparing transaction.',
                        startedAt: Date.now(),
                        status: 'STARTED',
                        type: 'CROSS_CHAIN'
                    }
                ]
            }
        };

        try {
            const swapResponse: { transactionRequest: LifiTransactionRequest; estimate: Estimate } =
                await LifiApiService.getQuote(
                    step.action.fromChainId,
                    step.action.toChainId,
                    step.action.fromToken.symbol,
                    step.action.toToken.symbol,
                    step.action.fromAmount,
                    step.action.fromAddress,
                    step.action.toAddress,
                    step.action.slippage
                );
            return {
                config: swapResponse.transactionRequest,
                amount: swapResponse.estimate.toAmountMin
            };
        } catch (err) {
            if ('statusCode' in err && 'message' in err) {
                throw new RubicSdkError(err.message);
            }
            throw err;
        }
    }

    @Cache({
        maxAge: 15_000
    })
    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
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
}
