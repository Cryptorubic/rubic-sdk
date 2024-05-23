import { Route } from '@lifi/sdk';
import { Estimate } from '@lifi/types/dist/step';
import BigNumber from 'bignumber.js';
import { RubicSdkError, SwapRequestError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { Cache } from 'src/common/utils/decorators';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import {
    BRIDGE_TYPE,
    BridgeType
} from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { LifiCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/constants/lifi-cross-chain-supported-blockchain';
import { LifiTransactionRequest } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/models/lifi-transaction-request';
import { getCrossChainGasData } from 'src/features/cross-chain/calculation-manager/utils/get-cross-chain-gas-data';

/**
 * Calculated Celer cross-chain trade.
 */
export class LifiCrossChainTrade extends EvmCrossChainTrade {
    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>,
        route: Route,
        feeInfo: FeeInfo,
        slippage: number,
        providerAddress: string,
        receiverAddress?: string
    ): Promise<GasData | null> {
        const trade = new LifiCrossChainTrade(
            {
                from,
                to: toToken,
                route,
                gasData: null,
                toTokenAmountMin: new BigNumber(0),
                feeInfo,
                priceImpact: from.calculatePriceImpactPercent(toToken) || 0,
                onChainSubtype: {
                    from: undefined,
                    to: undefined
                },
                bridgeType: BRIDGE_TYPE.LIFI,
                slippage
            },
            providerAddress || EvmWeb3Pure.EMPTY_ADDRESS,
            []
        );

        return getCrossChainGasData(trade, receiverAddress);
    }

    public readonly type = CROSS_CHAIN_TRADE_TYPE.LIFI;

    public readonly isAggregator = true;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

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

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            route: Route;
            gasData: GasData | null;
            toTokenAmountMin: BigNumber;
            feeInfo: FeeInfo;
            priceImpact: number | null;
            onChainSubtype: OnChainSubtype;
            bridgeType: BridgeType;
            slippage: number;
        },
        providerAddress: string,
        routePath: RubicStep[]
    ) {
        super(providerAddress, routePath);

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

            const { onConfirm, gasLimit, gasPriceOptions } = options;
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
                    gas: gasLimit,
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

        const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(options, {
            walletAddress: this.walletAddress,
            fromTokenAmount: this.from,
            toTokenAmount: this.to,
            srcChainTrade: null,
            providerAddress: this.providerAddress,
            type: `lifi:${this.bridgeType}`,
            fromAddress: this.walletAddress
        });
        const extraNativeFee = this.from.isNative
            ? new BigNumber(providerValue).minus(this.from.stringWeiAmount).toFixed()
            : new BigNumber(providerValue).toFixed();
        const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
            providerRouter,
            data!,
            this.fromBlockchain,
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
                await this.getResponseFromApiToTransactionRequest(step);

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

    protected override async setTransactionConfig(
        skipAmountChangeCheck: boolean,
        useCacheData: boolean,
        receiverAddress?: string
    ): Promise<EvmEncodeConfig> {
        if (this.lastTransactionConfig && useCacheData) {
            return this.lastTransactionConfig;
        }

        const { config, amount } = await this.getTransactionConfigAndAmount(receiverAddress);
        this.lastTransactionConfig = config;
        setTimeout(() => {
            this.lastTransactionConfig = null;
        }, 15_000);

        if (!skipAmountChangeCheck) {
            this.checkAmountChange(amount, Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals));
        }
        return config;
    }

    @Cache({
        maxAge: 15_000
    })
    private async getResponseFromApiToTransactionRequest(
        step: unknown
    ): Promise<{ transactionRequest: LifiTransactionRequest; estimate: Estimate }> {
        return this.httpClient.post('https://li.quest/v1/advanced/stepTransaction', {
            ...(step as {})
        });
    }

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
